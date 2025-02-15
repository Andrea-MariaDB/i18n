# contextBridge

> Создает безопасный, двунаправленный, синхронный мост через изолированные контексты

Процесс: [Графический](../glossary.md#renderer-process)

Пример предоставления API-интерфейса средству визуализации из изолированного сценария предварительной загрузки приведен ниже:

```javascript
// Предварительная загрузка (Isolated World/Изолированный Мир)
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
  'electron',
  {
    doThing: () => ipcRenderer.send('do-a-thing')
  }
)
```

```javascript
// Рендер (Main World/Основной Мир)

window.electron.doThing()
```

## Глоссарий

### Main World / Основной Мир

The "Main World" is the JavaScript context that your main renderer code runs in. By default, the page you load in your renderer executes code in this world.

### Isolated World / Изолированный Мир

When `contextIsolation` is enabled in your `webPreferences` (this is the default behavior since Electron 12.0.0), your `preload` scripts run in an "Isolated World".  You can read more about context isolation and what it affects in the [security](../tutorial/security.md#3-enable-context-isolation-for-remote-content) docs.

## Методы

Модуль `contextBridge` имеет следующие методы:

### `contextBridge.exposeInMainWorld(apiKey, api)` _Experimental_

* `apiKey` String - Ключ для вставки API в `window`.  API будет доступен в `window[apiKey]`.
* `api` any - Your API, more information on what this API can be and how it works is available below.

## Использование

### API

The `api` provided to [`exposeInMainWorld`](#contextbridgeexposeinmainworldapikey-api-experimental) must be a `Function`, `String`, `Number`, `Array`, `Boolean`, or an object whose keys are strings and values are a `Function`, `String`, `Number`, `Array`, `Boolean`, or another nested object that meets the same conditions.

Значения `Function` передаются в другой контекст, а все остальные значения **копируются** и **заморожены**. Any data / primitives sent in the API become immutable and updates on either side of the bridge do not result in an update on the other side.

An example of a complex API is shown below:

```javascript
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld(
  'electron',
  {
    doThing: () => ipcRenderer.send('do-a-thing'),
    myPromises: [Promise.resolve(), Promise.reject(new Error('whoops'))],
    anAsyncFunction: async () => 123,
    data: {
      myFlags: ['a', 'b', 'c'],
      bootTime: 1234
    },
    nestedAPI: {
      evenDeeper: {
        youCanDoThisAsMuchAsYouWant: {
          fn: () => ({
            returnData: 123
          })
        }
      }
    }
  }
)
```

### Функции API

Значения `Function`, которые вы связываете через `contextBridge`, передаются через Electron, чтобы гарантировать, что контексты остаются изолированными.  Это приводит к некоторым ключевым ограничениям, которые мы описали ниже.

#### Параметр / Ошибка / Поддержка возвращаемого типа

Because parameters, errors and return values are **copied** when they are sent over the bridge, there are only certain types that can be used. At a high level, if the type you want to use can be serialized and deserialized into the same object it will work.  Ниже для полноты изложения приводится таблица поддержки типов:

| Тип                                                                                                            | Сложность | Поддержка параметров | Возврат значения поддержки | Ограничения                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------- | --------- | -------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `String`                                                                                                       | Простой   | ✅                    | ✅                          | Нет                                                                                                                                                                                                                                 |
| `Number`                                                                                                       | Простой   | ✅                    | ✅                          | Нет                                                                                                                                                                                                                                 |
| `Boolean`                                                                                                      | Простой   | ✅                    | ✅                          | Нет                                                                                                                                                                                                                                 |
| `Object`                                                                                                       | Сложный   | ✅                    | ✅                          | Keys must be supported using only "Simple" types in this table.  Значения должны поддерживаться в этой таблице.  Модификации прототипа отбрасываются.  Отправка пользовательских классов будет копировать значения, но не прототип. |
| `Array`                                                                                                        | Сложный   | ✅                    | ✅                          | Те же ограничения, что и в типе `Object`                                                                                                                                                                                            |
| `Error`                                                                                                        | Сложный   | ✅                    | ✅                          | Ошибки, которые выбрасываются также копируются, это может привести к тому, что сообщение и трассировка стека ошибки немного изменятся из-за того, что они будут выброшены в другом контексте                                        |
| `Promise`                                                                                                      | Сложный   | ✅                    | ✅                          | Promises are only proxied if they are the return value or exact parameter.  Promises nested in arrays or objects will be dropped.                                                                                                   |
| `Function`                                                                                                     | Сложный   | ✅                    | ✅                          | Модификации прототипа отбрасываются.  Отправка классов или конструкторов не будет работать.                                                                                                                                         |
| [Cloneable Types](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) | Простой   | ✅                    | ✅                          | Смотрите связанный документ по клонируемым типам                                                                                                                                                                                    |
| `Element`                                                                                                      | Сложный   | ✅                    | ✅                          | Модификации прототипа отбрасываются.  Sending custom elements will not work.                                                                                                                                                        |
| `Symbol`                                                                                                       | Нет       | ❌                    | ❌                          | Символы не могут быть скопированы в разных контекстах, поэтому они отбрасываются                                                                                                                                                    |

If the type you care about is not in the above table, it is probably not supported.

### Exposing Node Global Symbols

The `contextBridge` can be used by the preload script to give your renderer access to Node APIs. The table of supported types described above also applies to Node APIs that you expose through `contextBridge`. Please note that many Node APIs grant access to local system resources. Be very cautious about which globals and APIs you expose to untrusted remote content.

```javascript
const { contextBridge } = require('electron')
const crypto = require('crypto')
contextBridge.exposeInMainWorld('nodeCrypto', {
  sha256sum (data) {
    const hash = crypto.createHash('sha256')
    hash.update(data)
    return hash.digest('hex')
  }
})
```
