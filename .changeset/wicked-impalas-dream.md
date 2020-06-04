---
'@sketch-hq/sketch-core-assistant': major
'@sketch-hq/sketch-assistant-cli': major
'@sketch-hq/sketch-assistant-types': major
'@sketch-hq/sketch-assistant-utils': major
---

Adjusted the signature of the `utils.report` function that rules use to report violations. This includes a change to support reporting multiple layers at once - `layer-styles-prefer-shared`, `text-styles-prefer-shared` and `groups-no-similar` rules have been updated to take advantage of this.
