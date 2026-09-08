# Caracas Metro recordings: sources and verification

The game now plays **17 short excerpts from public YouTube recordings**. There are no oscillators, generated noise, synthesized chimes, speech synthesis, voice clones, or generic subway-library substitutes. Missing or failed files stay silent.

## Recording sources

- [CAF S6 Overhaul Line 1 ride](https://www.youtube.com/watch?v=CAF0q0Humks), Venezuela Transport Info, published 2024-08-24. The creator identifies CAF S6 MR-74 and dates the full ride to 2024-08-19. The ride runs toward Propatria. The game uses brief motion and station-dwell excerpts, without directional announcements from that ride.
- [Line 1 station announcements](https://www.youtube.com/watch?v=ph1OAT0vqgY), Venezuela Transport Info, published 2021-11-20. Five station-name messages are extracted from the creator's compilation. Historical transfer wording remains as recorded.

The source pages and creator metadata were checked on 2026-09-08. Station chapter timestamps and video frames were checked against the five selected stops. Speech recognition helped locate the announcements; its imperfect transcripts are not used as replacement speech. Spectrograms helped locate the original door warning and closure. These are third-party recordings, not official isolated sound stems: carriage and platform noise remain audible.

## Included excerpts

Each link opens the actual source at the beginning of the excerpt. Full machine-readable provenance, processing gain, byte size and SHA-256 hashes are in [provenance.json](../public/audio/recordings/provenance.json).

| Gameplay clip | Source interval | Description |
| --- | --- | --- |
| `idle` | [17:41.00–17:45.00](https://www.youtube.com/watch?v=CAF0q0Humks&t=1061s) | Stationary CAF carriage ambience at Altamira; includes the original surroundings. |
| `rolling` | [18:10.00–18:22.00](https://www.youtube.com/watch?v=CAF0q0Humks&t=1090s) | CAF rolling inside the tunnel after Altamira. |
| `traction` | [17:58.00–18:07.00](https://www.youtube.com/watch?v=CAF0q0Humks&t=1078s) | CAF departure and acceleration from Altamira. |
| `braking` | [17:23.00–17:33.00](https://www.youtube.com/watch?v=CAF0q0Humks&t=1043s) | CAF slowing into Altamira; original traction/rail sound remains in the recording. |
| `brake-release` | [17:33.10–17:34.30](https://www.youtube.com/watch?v=CAF0q0Humks&t=1053s) | End-of-stop carriage/air sound; not an isolated pneumatic stem. |
| `doors-open` | [17:34.40–17:37.10](https://www.youtube.com/watch?v=CAF0q0Humks&t=1054s) | Door opening event at Altamira, recorded from the carriage. |
| `doors-close` | [17:47.40–17:53.80](https://www.youtube.com/watch?v=CAF0q0Humks&t=1067s) | Original sustained CAF warning tone followed by closure sounds at Altamira. |
| `arrival-cano-amarillo` | [00:58.30–01:02.80](https://www.youtube.com/watch?v=ph1OAT0vqgY&t=58s) | Station Caño Amarillo announcement. |
| `arrival-capitolio` | [01:05.35–01:12.70](https://www.youtube.com/watch?v=ph1OAT0vqgY&t=65s) | Station Capitolio announcement including transfer information. |
| `arrival-bellas-artes` | [01:31.90–01:36.80](https://www.youtube.com/watch?v=ph1OAT0vqgY&t=91s) | Station Bellas Artes announcement. |
| `arrival-plaza-venezuela` | [01:45.80–01:54.75](https://www.youtube.com/watch?v=ph1OAT0vqgY&t=105s) | Station Plaza Venezuela announcement including the recorded transfer information. |
| `arrival-altamira` | [02:16.75–02:21.50](https://www.youtube.com/watch?v=ph1OAT0vqgY&t=136s) | Station Altamira announcement. |
| `ambience-cano-amarillo` | [42:09.00–42:17.00](https://www.youtube.com/watch?v=CAF0q0Humks&t=2529s) | Caño Amarillo during the station dwell, captured from the train. |
| `ambience-capitolio` | [39:57.00–40:04.00](https://www.youtube.com/watch?v=CAF0q0Humks&t=2397s) | Capitolio during the station dwell, captured from the train. |
| `ambience-bellas-artes` | [33:49.00–33:57.00](https://www.youtube.com/watch?v=CAF0q0Humks&t=2029s) | Bellas Artes during the station dwell, captured from the train. |
| `ambience-plaza-venezuela` | [26:45.00–26:53.00](https://www.youtube.com/watch?v=CAF0q0Humks&t=1605s) | Plaza Venezuela during the station dwell, captured from the train. |
| `ambience-altamira` | [17:38.00–17:45.00](https://www.youtube.com/watch?v=CAF0q0Humks&t=1058s) | Altamira during the station dwell, captured from the train. |

## Editing and playback

Only trimming, fixed gain, 30 ms edge fades, mono conversion, and MP3 encoding were applied. Playback stays at the source's original rate and pitch. The movement recordings are short loops whose levels respond to the controls; this does not reconstruct a measured CAF motor-frequency curve. Service and emergency braking use the same real deceleration bed; no invented emergency alarm was added.

The native door controller uses a 3.2-second warning before a 3.2-second closing movement, matching the selected 6.4-second recording. Traction stays locked until the leaves finish closing, even when sound is muted. The warning stops if the doors reopen. Opening takes 2.7 seconds. These synchronization timings are visual estimates based on the selected recording.

The correct station announcement plays once when stopped within the existing 12 m stopping zone. It is selected by physical station position, not the next target index. Reopening doors and resuming after pause do not repeat it. Resetting the service makes all announcements eligible again. Each station has its own recorded ambience, audible while its doors are open. Voice playback lowers the other layers. Mute, pause and backgrounding silence the engine; the final arrival announcement and closing warning finish naturally on completion; loading failures are reported and retryable.

The FUENTES panel includes an individual player and a timestamped source link for every excerpt. Only one preview plays at a time. Closing the panel stops all previews.

## Rights and excluded candidates

Neither included source declares a Creative Commons or other redistribution licence in the retrieved metadata. The excerpts were added for the explicitly requested local prototype; permission for broader redistribution has not been established. Attribution does not grant a licence. No full video or full audio track is included.

The [OpenBVE route archive](https://sites.google.com/view/openbvevenezuela/rutas/metro-de-caracas) and [CAF simulator pack](https://noasociadoalopenbvenezuela.blogspot.com/p/metro-de-caracas_26.html) were inspected as research leads. Their filenames identify CAF and station sounds but do not establish the original recording method. **None of those simulator assets is bundled.** The mixed [Alstom/CAF compilation](https://www.youtube.com/watch?v=Ej0X90zrtNg) is retained as an external comparison, not a gameplay source.

## Reproduction and QA

With locally available source recordings named by their YouTube IDs, run:

    python3 scripts/extract-metro-audio.py /path/to/source-recordings

The script uses the recorded timecodes, preserves original pitch, and updates hashes. It does not download videos or generate sound. Full source media and research downloads remain outside the repository.

Run `npm test` and `npm run build`. `/audio-review.html` decodes the production files and checks audible motion, doors and all five stops, finite output, headroom, and silence during pause/backgrounding using OfflineAudioContext. `/audio/qa.html` redirects to this built page.

Verification on 2026-09-08: all 81 Node tests passed. The browser decoded all 17 recordings without failures. At 100% volume, every audible case had nonzero RMS; pause and hidden-tab cases had exactly zero output. The highest tested peak was 0.876773 (arrival overlapping door closure), below clipping. In-game checks confirmed 17 attributed preview players, exclusive preview playback and cleanup, the warning interlock, and immediate silence on window blur.
