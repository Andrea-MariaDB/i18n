# Objet d'Affichage

* `id` Nombre - Identifiant unique associé à l'affichage.
* `rotation` Number - Peut être 0, 90, 180, 270, représente la rotation de l'écran en degrés dans le sens horaire.
* `scaleFactor` Number - Facteur d'échelle en pixel du périphérique de sortie.
* `touchSupport` String - Peut être `available`, `unavailable`, `unknown`.
* `monochrome` Boolean - Si le display est un display monochrome ou non.
* `accelerometerSupport` String - Peut être `available`, `unavailable`, `unknown`.
* `colorSpace` String -  représente un espace de couleurs (objet en trois dimensions contenant toutes les combinaisons de couleurs réalisables) servant aux conversions colorimétriques
* `colorDepth` Number - Quantité de bits par pixel.
* `depthPerComponent` Number - Quantité de bits par composant de couleur.
* `displayFrequency` - Le taux de rafraîchissement de l’affichage.
* `bounds` [Rectangle](rectangle.md) - the bounds of the display in DIP points.
* `size` [Size](size.md)
* `workArea` [Rectangle](rectangle.md) - the work area of the display in DIP points.
* `workAreaSize` [Size](size.md)
* `internal` Boolean - `true` pour un display interne et `false` pour un display externe.

L’objet `Display` représente un affichage physique connecté au système. Un faux `Display` existe peut-être sur un système sans affichage physique, ou un `Display` peut correspondre à un écran virtuel distant.
