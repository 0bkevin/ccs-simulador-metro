# Audio sources and provenance

## Authentic Caracas references

These are genuine Caracas Metro references found during research, but no Creative Commons or other redistributable licence could be verified on the source pages. They are linked for listening/comparison only. No audio from them is downloaded, copied, or redistributed by this project; the app may open the creator-hosted YouTube player for optional listening.

The strongest primary visual/audio reference is [Metro De Caracas Compilación Trenes Alstom y CAF](https://www.youtube.com/watch?v=Ej0X90zrtNg) by Dani215 Railway (2024-07-17). Its description identifies Line 1 CAF Renfe Serie 6 units 61047–61080 alongside Alstom footage. The in-game sound remains synthesized; the hosted video is only an optional external comparison player.

| Recording | Creator / identification | Licence and use |
| --- | --- | --- |
| [Caracas Metro compilation (2006–2013)](https://www.youtube.com/watch?v=86YCTUO5gQw) | MonteBRujaFM; description identifies Caracas Line 1 footage | YouTube Standard License; comparison reference only |
| [Caracas Metro 10000/20000 sound example](https://www.youtube.com/watch?v=gtgx51bclew) | Linked as an older Alstom 10000/20000-series Caracas sound example in the transit discussion [thread](https://www.reddit.com/r/transit/comments/1t4ml31/what_train_makes_the_best_sound/) | No redistributable licence verified; comparison reference only |
| [Caracas Metro sound example 2](https://www.youtube.com/watch?v=cbB9gqDMQ0o) | Linked as an older Alstom 10000/20000-series Caracas sound example in the same discussion | No redistributable licence verified; comparison reference only |
| [Metro De Caracas Compilación Trenes Alstom y CAF](https://www.youtube.com/watch?v=Ej0X90zrtNg) | Dani215 Railway, published 2024-07-17; description identifies Line 1 CAF Renfe Serie 6 units 61047–61080 alongside Alstom footage | No redistributable licence verified; primary creator footage for listening/comparison only |

## Visual references

[Metro de Caracas Línea 1](https://commons.wikimedia.org/wiki/File:Metro_de_caracas_linea_1.jpg) by Karlos Corbella / Metro and [this Caracas Metro gallery image](https://bus-america.com/galeria/displayimage.php?pid=26432) were inspected for exterior proportions and livery. They are references only; no image was copied into the repository.

The [OpenBVE Venezuela Metro de Caracas page](https://noasociadoalopenbvenezuela.blogspot.com/p/metro-de-caracas_26.html) identifies a downloadable pack containing a “CAF SERIE 6” train and links to the [MediaFire archive](https://www.mediafire.com/file/om2u9qlgt7gaahw/Pack_Series_10000_y_60000_MCCS_FINAL.zip/file). The archive contains CAFS6 WAV filenames (`Motor0.wav`, `motor1.wav`, `Motor2.wav`, `loop.wav`, `Rub.wav`, and `run0.wav`–`run5.wav`) plus a `train.txt` identifying “C.A.F. Renfe Serie 6.” It contains no README, licence, or reuse permission, and its files are simulator assets rather than documented field recordings. It is therefore a useful external lead and listening/comparison source, but no file is copied into this project.

The search did not locate a downloadable Line 1 recording with an explicit CC0, CC BY, or equivalent licence and a traceable creator. The authentic references therefore remain external links, and `src/audio.js` uses a clearly labelled procedural fallback. Generic subway sound libraries are not labelled as Caracas recordings.

## Implementation provenance

`src/audio.js` contains no copied recording. It synthesizes separate layers for the CAF-like inverter impression, rolling rail noise, axle clicks, door chime/hiss, brake rub, and low HVAC bed. All gain changes are ramped into a compressor/limiter, and audio remains silent until the user enables it. Browser suspension, page visibility, pause, and mute are handled by the caller/state update path.

## QA harness

`public/audio/qa.html` renders the engine through `OfflineAudioContext`. The final browser run verified finite output and a peak below 0.5: idle RMS 0.00030731 (peak 0.0004712), motion RMS 0.00638441 (peak 0.0235521), coast RMS 0.00510890 (peak 0.0223561), braking RMS 0.00430532 (peak 0.0179588), paused RMS 0 (peak 0), and door-close RMS 0.00149951 (peak 0.0094313). The harness also exposes a short live motion listen button.
