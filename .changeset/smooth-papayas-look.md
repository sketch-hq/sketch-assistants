---
'@sketch-hq/sketch-assistant-cli': major
'@sketch-hq/sketch-assistant-types': major
'@sketch-hq/sketch-assistant-utils': major
---

Changed the `RunOutput` type so its shape is more consistent when an Assistant outputs an error or a
result. This is so that it plays nicely with Swift Codable, which has trouble decoding JSON derived
from TypeScript discriminated unions.
