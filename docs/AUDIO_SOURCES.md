# Caracas Metro recordings: sources and verification

The audio catalogue contains **17 short excerpts from public YouTube recordings**. There are no oscillators, generated noise, synthesized chimes, speech synthesis, voice clones, or generic subway-library substitutes. Missing or failed files stay silent.

## Recording sources

- [CAF S6 Overhaul Line 1 ride](https://www.youtube.com/watch?v=CAF0q0Humks), Venezuela Transport Info, published 2024-08-24. The creator identifies CAF S6 MR-74 and dates the full ride to 2024-08-19. The ride runs toward Propatria. The game uses brief motion and station-dwell excerpts, without directional announcements from that ride.
- [Line 1 station announcements](https://www.youtube.com/watch?v=ph1OAT0vqgY), Venezuela Transport Info, published 2021-11-20. Five station-name messages are extracted from the creator's compilation. Historical transfer wording remains as recorded.

The source pages and creator metadata were checked on 2026-09-08. Station chapter timestamps and video frames were checked against the five selected stops. Speech recognition helped locate the announcements; its imperfect transcripts are not used as replacement speech. Spectrograms helped locate the door warning and likely opening/closure intervals. These are third-party recordings, not official isolated sound stems: carriage and platform noise remain audible. The manifest's `verified-recording` flag means that the excerpt was traced to the attributed upload; it does not certify the uploader's original capture method or independently identify each mechanical sound.

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

Only trimming, fixed gain, 30 ms edge fades, mono conversion, and MP3 encoding were applied. Playback stays at the source's original rate and pitch. Rolling and station surroundings loop; acceleration and deceleration play once per control event and stop when that event ends. Holding a control does not repeatedly replay a departure or stop. Braking overrides traction, matching the simulation. Service and emergency braking share the real deceleration excerpt; no invented emergency alarm was added. The end-of-stop excerpt is used only after braking, not coasting or recovery. This sample-based mix does not reconstruct a measured CAF motor-frequency curve or distinguish the real emergency brake sound.

The `idle` excerpt remains available in FUENTES for comparison, but is excluded from gameplay: its Altamira platform surroundings are unsuitable as a universal cab hum. No substitute hum is generated when stopped between stations.

The native door controller uses a 3.2-second warning before a 3.2-second closing movement, matching the selected 6.4-second recording. Traction stays locked until the leaves finish closing, even when sound is muted. The warning stops if the doors reopen; cancelling while the leaves are still fully open produces no opening sound. Opening takes 2.7 seconds. Animation uses elapsed seconds and playback seeks to its physical phase when needed, including sound activation mid-cycle. Restart restores the initial open leaves. These synchronization timings are estimates based on the selected recording, not independently measured CAF specifications.

The station announcement plays once when stopped within the existing 12 m stopping zone. It is selected by physical station position, not the next target index. Reopening doors does not repeat it. Pause and backgrounding silence playback and retain interrupted one-shot offsets, including at the final stop. Resuming continues those recordings; explicit mute cancels them. Resetting the service makes all announcements eligible again. Each station has its own ambience, audible while its physical leaves are open, including the closing warning, and fading with their closure. Voice playback lowers rolling, motion and station layers. The final arrival announcement and closing warning finish naturally on completion. Loading failures are reported and retryable; a stalled file times out after 15 seconds so usable files can still play.

The FUENTES panel includes an individual player and a timestamped source link for every excerpt. Only one preview plays at a time. Closing the panel stops all previews; hiding the page stops previews as well.

## Rights and excluded candidates

Neither included source declares a Creative Commons or other redistribution licence in the retrieved metadata. The excerpts were added for the explicitly requested local prototype; permission for broader redistribution has not been established. Attribution does not grant a licence. No full video or full audio track is included.

The [OpenBVE route archive](https://sites.google.com/view/openbvevenezuela/rutas/metro-de-caracas) and [CAF simulator pack](https://noasociadoalopenbvenezuela.blogspot.com/p/metro-de-caracas_26.html) were inspected as research leads. Their filenames identify CAF and station sounds but do not establish the original recording method. **None of those simulator assets is bundled.** The mixed [Alstom/CAF compilation](https://www.youtube.com/watch?v=Ej0X90zrtNg) is retained as an external comparison, not a gameplay source.

## Reproduction and QA

With locally available source recordings named by their YouTube IDs, run:

    python3 scripts/extract-metro-audio.py /path/to/source-recordings

The script uses the recorded timecodes, preserves original pitch, and updates hashes. It does not download videos or generate sound. Full source media and research downloads remain outside the repository.

Run `npm test` and `npm run build`. `/audio-review.html` decodes the production files and checks audible motion, doors and all five stops, finite output, headroom, and silence during pause/backgrounding using OfflineAudioContext. `/audio/qa.html` redirects to this built page.

Adversarial verification on 2026-09-08: all 89 Node tests passed, including eight added cases and a corrected pause test that previously accepted lost announcements. New checks cover control priority, non-repeating motion events, physical door ambience, coasting/recovery, stalled downloads, final-stop backgrounding, 5 FPS door synchronization, mid-cycle unmute, warning cancellation, door reset, a complete service through all five actual stop positions, and stale audio-device resume failures. The browser decoded all 17 recordings without failures. At 100% volume, every expected audible case had nonzero RMS; pause and hidden-tab cases had zero output. The highest tested peak was 0.880492, below clipping. Temporal OfflineAudioContext checks confirmed silence during a one-second pause and continuation of both the announcement and door recording from approximately 1.00136 seconds, including after service completion.

All 17 files were also decoded and compared with their exact intervals in the locally retained source media. Excluding the edited 50 ms at each edge, normalized waveform correlation was at least 0.999829; decoded durations matched the declared intervals. This verifies excerpt integrity and unchanged duration, not official acoustic accuracy. The five announcement selections follow the compilation's station sequence and corresponding images; automated transcripts remain imperfect, especially for Altamira and Plaza Venezuela. A native listener's comparison and a documented CAF field recording would be needed to independently certify every word and mechanical event. No such certification is claimed.

Browser checks of the actual game handlers, with rendering frames controlled by the review harness, also passed: rapid sound on/off kept the button and engine consistent, pause silenced playback, resume restored it, closing/reopening during the warning cancelled the door sound, and reset restored open leaves. All 17 native preview players were present; only one played at a time, closing FUENTES reset them, and window blur paused the game and silenced its audio. The production audio-review page passed the same decoding and temporal checks as development.
