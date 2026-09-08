import"./modulepreload-polyfill-B5Qt9EMX.js";import{s as me,O as he,l as ge,W as fe,T as be}from"./style-2FX8oNIw.js";import{c as we,a as ve,p as se,b as ye,d as le,g as ce,e as Ae,f as de,s as Ce,h as Te}from"./station-camera-BFjsLpJf.js";import{c as Ee,a as xe,b as ke,r as Se}from"./train-doors-Fqcm_BJG.js";import{c as Re,a as Le,b as ze,r as Ie}from"./audio-GXOP61cc.js";const Pe=`# Línea 1 del Metro de Caracas: investigación para el juego

## Datos verificados

La Línea 1 une Propatria y Palo Verde, cruza Caracas de oeste a este y tiene 22 estaciones. Las referencias publican una longitud de 20,36 km (20,4 km redondeados); un estudio de JICA/Compañía del Metro registra 20,6 km en 2003. Abrió por fases: Propatria–La Hoyada (2-ene-1983), La Hoyada–Chacaíto (27-mar-1983), Chacaíto–Los Dos Caminos (23-abr-1988) y Los Dos Caminos–Palo Verde (19-nov-1989).

Orden oeste → este: Propatria, Pérez Bonalde, Plaza Sucre, Gato Negro, Agua Salud, Caño Amarillo, Capitolio, La Hoyada, Parque Carabobo, Bellas Artes, Colegio de Ingenieros, Plaza Venezuela, Sabana Grande, Chacaíto, Chacao, Altamira, Miranda, Los Dos Caminos, Los Cortijos, La California, Petare y Palo Verde.

La alimentación publicada es 750 V de corriente continua mediante tercer riel; el ancho de vía es estándar, 1.435 mm. La red usa rodadura férrea. Los trenes tienen cabina y equipos para comunicación con el Centro de Control, cierre de puertas y actuaciones de emergencia, aunque el servicio fue concebido con automatización/protección de tren. La renovación de Línea 1 (aprox. 2010–2012) incluyó material rodante CAF Serie 6, electrificación, rieles y señalización/control; también se sustituyeron vía, cableado y sistemas.

## Estaciones y obra civil

Agua Salud y Caño Amarillo son las dos únicas estaciones superficiales/a nivel de la Línea 1; el resto se describe como subterráneo. La arquitectura original fue diseñada por Mario Bemergui. Propatria se integra con una plaza; Capitolio tiene la mezzanina en un extremo; La Hoyada tiene cuatro niveles y dos mezzaninas, una configuración excepcional para el complejo; las estaciones subterráneas suelen resolver el flujo con vestíbulo/mezzanina y dos andenes laterales. En el juego, los niveles y acabados se interpretan visualmente, porque no hay planos constructivos públicos completos de cada estación.

La rehabilitación ferroviaria documentada incluyó renovación de vía en placa, rieles, traviesas, elementos elásticos, sujeciones, aparatos de vía y aisladores/capotas del tercer riel. Es información útil para modelar rieles, tercer riel protegido, cambios y patios, pero no permite inferir dimensiones exactas de túnel ni el perfil longitudinal.

No se encontró un expediente público completo que permita asignar método constructivo a cada tramo. En obra ferroviaria urbana se combinan normalmente excavación entre pantallas/corte y cubierta para cajas poco profundas, excavación convencional o tuneladora para túneles profundos y estructuras superficiales para estaciones a nivel. En el juego, la estación se modela como una caja de andén simplificada y los túneles como geometría continua; no se presenta ese modelo como sección constructiva real de Caracas.

## Trenes y mecánica

El material original de Línea 1 fue el CIMT Lorraine/Alsthom Atlantique (Serie 1; trenes de siete vagones, construidos 1981–1984). La renovación seleccionó CAF Serie 6: 48 trenes, siete vagones, construidos 2010–2012, con operación en Línea 1. Alstom confirma que para 2005 había entregado 600 coches a las líneas 1, 2 y 3 y mantenía 400, evidencia primaria de su papel histórico, aunque no es una ficha de la Serie 1. Las fuentes públicas describen los Serie 6 como unidades eléctricas de metro alimentadas por 750 V CC y con el nuevo diseño exterior/interior de la rehabilitación. Hay imágenes y tablas de composición, pero no se encontró una ficha pública del Metro de Caracas que confirme dimensiones, potencia por motor, aceleración máxima o tipo exacto de freno de la Serie 6.

La implementación actual del juego tiene dos controles de frenado simplificados: freno de servicio y freno de emergencia. El servicio reduce la velocidad gradualmente; la emergencia aplica una desaceleración mayor. No se simulan por separado la recuperación eléctrica, la resistencia de frenado, el circuito neumático, el compresor, el freno de estacionamiento ni el sistema de protección del tren. La explicación de esos sistemas que sigue es conceptual y no describe controles actualmente visibles en el juego.

La rehabilitación de control de Línea 1 se asocia en fuentes secundarias con el proyecto Sirius CBTC/ATS/ATP. La documentación técnica de una ponencia de modernización describe la migración del ATC PA-135 a CBTC, códigos de velocidad de respaldo y ATS Rail9000. El estado operativo histórico y las críticas de instalación no se consideran hechos mecánicos universales: son asuntos de operación y deben presentarse como contexto, no como comportamiento exacto del tren del juego.

Como mecánica ferroviaria general (modelo didáctico, no ficha de Caracas), el tercer riel entrega corriente al equipo de tracción; el convertidor regula el par de los motores en los bogies; los bogies guían el coche y transmiten esfuerzos, mientras suspensión primaria/secundaria filtra vibración. Esta cadena se ilustra en la documentación de producto de Alstom para Metropolis, que describe alimentación por tercer riel, motores, bogies y sistemas de tracción, pero no demuestra que esos componentes concretos sean los de CAF Serie 6 de Caracas ([Alstom Metropolis](https://www.alstom.com/sites/alstom.com/files/2021/09/17/Alstom_Product_Sheet_Metropolis_EN.pdf)).

Un bogie normalmente integra dos ejes y ruedas solidarias en cada eje; la adherencia rueda–riel limita el esfuerzo de tracción y de frenado. La suspensión primaria aísla irregularidades entre eje/bogie y bastidor, y la secundaria aísla el bastidor de la caja. Son principios de diseño ferroviario, no dimensiones verificadas del Serie 6. La caja de un metro añade estructura, cableado de alta y baja tensión, convertidores auxiliares, HVAC, puertas eléctricas, interfonía, información al pasajero y acoples entre coches. Alstom documenta estos subsistemas en trenes de metro comparables, y la reconstrucción específica del CAF Caracas se documenta con sus propias fotografías y manuales en [EXTERIOR_MODEL.md](EXTERIOR_MODEL.md) y [TRAIN_INTERIOR_REFERENCES.md](TRAIN_INTERIOR_REFERENCES.md) ([Alstom Sydney Metro EPD](https://www.alstom.com/sites/alstom.com/files/2024/06/20/Alstom_EPD_SYDNEY_METRO_EN.pdf)).

Los modos de frenado no son equivalentes: el freno eléctrico convierte energía cinética en energía eléctrica; si la red puede absorberla, es regenerativo, y si no, el equipo puede disiparla en resistencias. El freno neumático aplica fuerza de fricción en rueda o disco mediante aire comprimido; requiere compresor, tratamiento/secado, depósitos y válvulas. El freno de emergencia prioriza distancia y seguridad, y el freno de estacionamiento mantiene inmóvil la unidad sin depender de la orden normal de marcha. Knorr-Bremse documenta en metros la cadena de aire comprimido, fricción, control electro-neumático, control de deslizamiento y funciones de estacionamiento, pero no identifica ese proveedor en Línea 1 ([Knorr-Bremse metros](https://rail.knorr-bremse.com/en/us/portfolio/vehicle-types/metros/), [control neumático](https://rail.knorr-bremse.com/en/dk/portfolio/products-and-systems/braking-systems/control/pneumatic-control/)). Alstom describe en otro metro una combinación de freno eléctrico regenerativo y mecánico para servicio, freno mecánico para emergencia y freno de estacionamiento; se usa aquí solo para explicar la separación de funciones ([Alstom MF2000](https://www.alstom.com/press-releases-news/2006/5/Paris-metro-delivery-of-45-MF-2000-trainsets-for-line-2-to-begin-in-July-20070510)).

La protección de marcha (ATP) supervisa velocidad y límites; el ATS coordina la explotación y el ATO puede automatizar aceleración, parada y puertas bajo autorización. La ponencia del proyecto de modernización vincula Línea 1 con migración PA-135/Sirius CBTC y ATS Rail9000; no se usa aquí para afirmar qué modo exacto está activo hoy. En el juego, el jugador controla aceleración y frenado y debe abrir/cerrar puertas dentro de la zona de parada; la interfaz muestra velocidad y próxima estación. No es una réplica de la cabina ni implementa una supervisión ATP/ATS/ATO.

## Escala del juego

En \`src/route.js\`, \`distance\` es una distancia acumulada comprimida de 12.480 m para que el recorrido completo sea manejable en WebGL. El trazado visual actual es recto y no reproduce pendientes, curvas ni un perfil topográfico real; las distancias sirven para ordenar las paradas y controlar la simulación.

## Fuentes

- [JICA, Base de datos de líneas vitales del Área Metropolitana de Caracas, tabla de líneas del metro (PDF)](https://openjicareport.jica.go.jp/pdf/11789237_03.pdf) — longitud, año, estaciones y fuente “Compañía del Metro”.
- [Línea 1 del Metro de Caracas, ficha técnica y cronología](https://es.wikipedia.org/wiki/L%C3%ADnea_1_(Metro_de_Caracas)) — orden de estaciones, 20,36 km, 750 V CC/tercer riel, ancho 1.435 mm y fases de apertura; fuente secundaria, contrastada con JICA.
- [Metro de Caracas, material rodante y sistemas](https://es.wikipedia.org/wiki/Metro_de_Caracas) — generaciones, composición publicada, 750 V CC, cabina y patios; fuente secundaria.
- [Fundación Arquitectura y Ciudad, estaciones de 1983](https://fundaayc.com/2014/07/21/1983-estaciones-del-metro-de-caracas/) — autoría de Mario Bemergui, tipologías y La Hoyada.
- [UrbanRail, galería fotográfica de Caracas](https://www.urbanrail.net/am/cara/pix/caracas-gallery1.htm) — observación visual secundaria de andenes, accesos y acabados; las fotografías no se reutilizan como texturas.
- [ASCH, rehabilitación de Línea 1](https://www.aschinfraestructuras.com/linea-caracas) — renovación de vía, aparatos de vía y tercer riel.
- [Metro de Caracas, estación Plaza Venezuela](https://metrodecaracas.com/linea-1/plaza-venezuela/) — accesos, conexiones y descripción de infraestructura; sitio informativo no identificado como portal histórico oficial.
- [CAF, catálogo general](https://admin.cafmobility.com/uploads/281_CAF_Catalogo_General_ES_601604d06c.pdf) — presencia de CAF en proyectos de Metro de Caracas; no aporta una ficha completa de la Serie 6.
- [Alstom, comunicado de contrato para Metro de Caracas (2005)](https://www.alstom.com/fr/press-releases-news/2005/9/ALSTOM-remporte-un-contrat-cle-en-main-pour-le-Metro-de-Caracas-au-Venezuela-20050916) — fuente primaria: 600 coches entregados a las líneas 1–3 y 400 mantenidos hasta 2005.
- [Ponencia Highlight Project: Caracas Metro Line 1](https://www.cmic.org.mx/cmic/eventos/infraestructuraferroviaria/ponencias/Dia3/789-Julian_Brasero_Sanchez.pdf) — migración de señalización PA-135 a Sirius CBTC/ATS y códigos de velocidad.

## Límites y decisiones de representación

No se inventan dimensiones de vagón, potencia, velocidad máxima, aceleración, deceleración, tipo de convertidor, número de motores por coche ni esquema exacto de freno: no aparecen en una ficha pública verificable consultada. Las texturas, personas, anuncios y detalles de cada estación en el juego son recreaciones artísticas inspiradas en la red y no fotografías ni planos oficiales.

La identificación de la Serie 6, su composición de siete coches y el pedido de 48 trenes procede de fuentes secundarias recopiladas en la ficha de material rodante; la fuente primaria de Alstom consultada confirma su actividad histórica en las líneas 1–3, pero no certifica la flota CAF. Tampoco se afirma aquí qué trenes están operativos en una fecha concreta ni qué fabricante suministró el freno de la Serie 6. Las conclusiones sobre aire comprimido, bogies, adherencia, recuperación de energía y separación ATP/ATS/ATO se mantienen como explicación general respaldada por fabricantes, no como especificación de Línea 1.
`,je=`# Línea 1 station references (five-station game route)

This note supports the reduced west-to-east route: **Caño Amarillo → Capitolio → Bellas Artes → Plaza Venezuela → Altamira**. It records what can be seen in the downloaded photographs and what is documented by station references. Any dimensional advice under “game implementation estimate” is a modelling choice for the game; it is not a measured station dimension.

The retained local photographs are in \`blender/references/\`. Some older links below refer to a former temporary research directory; the current inventory is listed at the end. UrbanRail credits the gallery photographs to Dietmar Bothe (2012) and the gallery page to R. Schwandl; Commons files retain the attribution and licence shown on their file pages. These references are not used as in-game textures.

## Platform-type quick reference

| Station | Line 1 platform arrangement | Structure | Evidence |
| --- | --- | --- | --- |
| Caño Amarillo | 2 side platforms, 2 tracks | elevated | [station reference](https://en.wikipedia.org/wiki/Ca%C3%B1o_Amarillo_station); Commons platform photograph |
| Capitolio | 2 side platforms, 2 tracks | underground | [station reference](https://en.wikipedia.org/wiki/Capitolio_station); UrbanRail platform photograph |
| Bellas Artes | 1 island platform, 2 tracks | underground | [station reference](https://en.wikipedia.org/wiki/Bellas_Artes_station_%28Caracas%29); UrbanRail platform photograph |
| Plaza Venezuela L1 | 2 side platforms, 2 tracks, upper level | underground interchange | [station reference](https://en.wikipedia.org/wiki/Plaza_Venezuela_station); UrbanRail L1 photographs |
| Altamira | 1 island platform, 2 tracks | underground | [station reference](https://en.wikipedia.org/wiki/Altamira_station); [architecture reference](https://fundaayc.com/2024/07/14/algo-mas-sobre-la-postal-no-411/) |

The platform counts are useful for geometry and camera placement. They should not be generalized across the five stations: Bellas Artes and Altamira are island platforms, while Caño Amarillo, Capitolio and the L1 level at Plaza Venezuela are side-platform stations.

## Caño Amarillo

### Observed/documented features

- This is an elevated Line 1 station and one of the two above-ground/surface stations on Line 1. The Commons platform photograph shows two tracks with platforms on the outer sides, a narrow trackside safety barrier, and yellow platform-edge lines.
- The strongest interior reference is \`blender/references/cano-amarillo-station.jpg\`. It shows the yellow steel space-frame roof, narrow daylight strips, and dark station-name fascias. Close inspection during the September 2026 pass corrects the earlier “glass block” interpretation: the rear screens have deep open square cells and substantial concrete bay frames. The updated native model represents these as open concrete grilles; the exact precast specification is not available.
- The elevated exterior is visible in [\`cano-amarillo-exterior.jpg\`](/tmp/metro-station-refs/cano-amarillo-exterior.jpg): a concrete viaduct, yellow guardrails, blue-painted slender light poles, dense green valley vegetation and steep Caracas hills. This is a useful silhouette/context reference even though the view is from outside the station.
- The 1992 article by architect Mario Bemergui classifies Caño Amarillo as the Line 1 **elevated** typology and discusses the plaza/access sequence. Its 1983 exterior photograph shows a paved linear plaza alongside the rail structure. The [Foundation Arquitectura y Ciudad station note](https://fundaayc.com/2014/07/21/1983-estacion-cano-amarillo/) identifies Bemergui as architect and notes the adjacent Carlos Gardel homage by Marisol. The downloaded [\`cano-amarillo-gardel.jpg\`](/tmp/metro-station-refs/cano-amarillo-gardel.jpg) documents the statue as an adjacent public-space landmark, not as a platform object.

### Game implementation estimate

Use two narrow side-platform strips outside two tracks, a single elevated deck, and a visually dominant yellow lattice canopy with translucent strips. Keep the plaza and Gardel landmark outside the paid platform area. Pick the platform length, deck height and truss spacing to fit the game route; no exact Caño Amarillo measurements were found in the references above.

## Capitolio

### Observed/documented features

- Capitolio is an underground Line 1 station with **two side platforms**. It is a transfer station to Line 2 through the El Silencio connection; the game can represent this as a concourse/corridor connection rather than a second full route.
- [\`capitolio-03.jpg\`](/tmp/metro-station-refs/capitolio-03.jpg) shows a broad concourse/ticket-hall space: yellow glazed-tile wall piers, grey polished floor, a dark horizontal slat ceiling, rectangular fluorescent fixtures and paired escalators/stairs. The image is captioned “Exit from ticket hall to Avenida Universidad.”
- [\`capitolio-07.jpg\`](/tmp/metro-station-refs/capitolio-07.jpg) shows a side platform: the track is to the right of the camera, with a concrete column and stair/escalator core between the platform and the deeper concourse. The floor is dark, finely gridded, and the ceiling combines concrete beams with fluorescent strip fixtures. Orange \`SALIDA\` signage and black/orange pictograms are visible.
- The station is part of the original 1983 Propatria–La Hoyada section. The 1992 Bemergui article names Capitolio as one of the stations relating the first Line 1 to Caracas’s historic central area, but it does not publish a full Capitolio plan in the consulted pages.

### Game implementation estimate

Model two separate side platforms and place the vertical circulation/core toward one end or behind the platform. Use yellow glazed tile as the recognizable Capitolio accent, with a ribbed dark ceiling and rectangular fluorescent lights. Treat the Line 2 transfer as a short signed corridor/portal; its exact path and dimensions are not inferred here.

## Bellas Artes

### Observed/documented features

- Bellas Artes is an underground Line 1 station with **one island platform** serving two tracks. The island arrangement is unambiguous in the platform photograph: trains sit on both sides of the central passenger area.
- [\`bellas-artes-09.jpg\`](/tmp/metro-station-refs/bellas-artes-09.jpg) shows the island platform with trains on the left and right, a central escalator/stair opening, dark slatted ceiling, repeated rectangular fluorescent fixtures, dark grey gridded flooring, yellow boarding/safety markings and overhead orange \`SALIDA\` signage. Directional signs and no-entry/accessibility pictograms use the black fascia/orange-white Metro sign language.
- [\`bellas-artes-02.jpg\`](/tmp/metro-station-refs/bellas-artes-02.jpg) shows the street entrance: a low, grey concrete/metal portal with horizontal ventilation slats, a rounded/stepped landing, a black sign panel with the orange Metro \`M\`, white \`Bellas Artes\` lettering and orange/white pictograms. The entrance is integrated into a dense urban sidewalk beside large buildings.
- The station’s name refers to the nearby **Museo de Bellas Artes de Caracas** (the nearby Plaza de los Museos also includes the Galería de Arte Nacional). That cultural context is useful for exterior dressing, but the photographs do not justify adding a particular artwork inside the station. ([Spanish station reference](https://es.wikipedia.org/wiki/Bellas_Artes_%28metro_de_Caracas%29), [Radio Orinoco summary of the name](https://www.radio-orinoco.com/2016/04/27/la-historia-detras-de-los-nombres-de-algunas-estaciones-del-metro-de-caracas/))

### Game implementation estimate

Build one island slab between two tracks, with a central escalator/stair opening and a dark slatted ceiling. Use the street portal as the exterior identifier: rounded concrete landing, horizontal grille and black \`Bellas Artes\` sign fascia. Do not split this station into two side platforms.

## Plaza Venezuela (Line 1 level)

### Observed/documented features

- Plaza Venezuela is a multi-line underground interchange. **For this game route, the represented platform is the Line 1 upper level: two side platforms and two tracks.** The later Line 3 station is a separate lower-level pair of side platforms. The Line 1 section opened in 1983; Line 3 opened later (1994).
- [\`plaza-venezuela-l1-01.jpg\`](/tmp/metro-station-refs/plaza-venezuela-l1-01.jpg) is explicitly captioned by UrbanRail as “Línea 1 - Estación Plaza Venezuela,” with passengers waiting for an incoming train to Palo Verde. It shows a side platform, a dark ribbed ceiling, bright linear fluorescent lighting, yellow edge markings, black signs and a transfer sign reading \`Línea 2 / Línea 3\`.
- [\`plaza-venezuela-l1-02.jpg\`](/tmp/metro-station-refs/plaza-venezuela-l1-02.jpg) is explicitly captioned as passengers entering a full Line 1 train to Palo Verde. It shows the side-platform geometry, dense yellow boarding marks, the red/silver train with rainbow stripe, and a large overhead \`Trenes Dirección EL VALLE\` transfer sign.
- [\`plaza-venezuela-L3-04.jpg\`](/tmp/metro-station-refs/plaza-venezuela-L3-04.jpg) is kept only as a comparison warning: its UrbanRail caption says **Line 3**, with a train toward El Valle. Do not use this photo as the L1 platform layout. It demonstrates why the two levels must be distinguished when recreating signage and transfer geometry.
- The Wikipedia station reference documents the four-track/two-level arrangement: two side platforms on the upper Line 1 level and two side platforms on the lower Line 3 level. The [UrbanRail gallery](https://www.urbanrail.net/am/cara/pix/caracas-gallery4.htm) supplies the photographed Line 1 and Line 3 views.

### Game implementation estimate

Represent the L1 stop as two side platforms with a busy transfer concourse/signage pocket. Add a clearly signed transfer route to the lower-level L3/L4 system only if gameplay needs it; do not merge the L3 track box into the L1 platform. The route can compress the interchange vertically and longitudinally, but the two-level distinction should remain visible through stairs/escalators, signs and a separate lower portal.

## Altamira

### Observed/documented features

- Altamira is an underground Line 1 station with **one central island platform** and two tracks. The platform photograph shows a train on each side of the island and a central vertical-circulation axis.
- [\`altamira-07.jpg\`](/tmp/metro-station-refs/altamira-07.jpg) shows the platform: a central escalator/stair block, dark ribbed ceiling, warm orange/brown wall tiles, dark gridded floor, yellow boarding boxes/arrows, overhead white direction signs (\`PALO VERDE\`, \`PROPATRIA\`) and green \`SALIDA\` signs. [\`altamira-08.jpg\`](/tmp/metro-station-refs/altamira-08.jpg) shows the same island arrangement from the opposite direction.
- [\`altamira-04.jpg\`](/tmp/metro-station-refs/altamira-04.jpg) shows the concourse/ticket hall: exposed concrete columns, open horizontal/slatted dark ceiling, polished grey floor, escalators and orange accent walls/signage. It is a useful concourse material reference.
- [\`altamira-03.jpg\`](/tmp/metro-station-refs/altamira-03.jpg) shows the distinctive exterior approach from Plaza Altamira: a sunken entrance, broad stair flights, a pedestrian bridge across the opening, green/turquoise railings, planted beds and water/fountain elements. This is a public-space entrance sequence, not the underground platform.
- The [Fundación Arquitectura y Ciudad article](https://fundaayc.com/2024/07/14/algo-mas-sobre-la-postal-no-411/) describes a typical station envelope approximately 150 m long, with a mezzanine about 4 m above the platform and the street about 8 m above the platform. It also describes exposed reinforced-concrete structure, floating mezzanine slabs in the double-height volume, a north/south central stair axis and a south semicircular amphitheatre. Treat these as source-reported architectural dimensions/features, not as game scale.

### Game implementation estimate

Use a single island platform with the stair/escalator axis centered in the station, dark slatted ceiling, orange/brown wall panels and strong green \`SALIDA\` signage. Recreate the sunken Plaza Altamira entrance as the exterior landmark, with a bridge and planted/water edges. If using the article’s 150 m length, 4 m mezzanine offset and 8 m street offset, label the game values as a scale interpretation rather than a survey.

## Image/source index

- UrbanRail gallery 1 (Altamira and Bellas Artes): <https://www.urbanrail.net/am/cara/pix/caracas-gallery1.htm>
- UrbanRail gallery 2 (Capitolio): <https://www.urbanrail.net/am/cara/pix/caracas-gallery2.htm>
- UrbanRail gallery 4 (Plaza Venezuela): <https://www.urbanrail.net/am/cara/pix/caracas-gallery4.htm>
- Caño Amarillo Commons category and file list: <https://commons.wikimedia.org/wiki/Category:Ca%C3%B1o_Amarillo_%28Caracas_Metro%29>
- Caño Amarillo architecture note (Mario Bemergui attribution and Gardel context): <https://fundaayc.com/2014/07/21/1983-estacion-cano-amarillo/>
- Bemergui, “La arquitectura de estaciones: El Metro de Caracas” (1992 PDF): <https://recyt.fecyt.es/index.php/CyTET/article/download/83795/61863/276024>

## Native Blender station rebuild · September 2026

The station meshes now use the 2012 photographic appearance as a consistent
baseline. This is not a reconstruction of every later repair or repainting.
The source is \`blender/metro_caracas_line1.blend\`; geometry is authored in
\`blender/station_models.py\` and \`blender/station_architecture.py\`. The web
viewer displays the exported native meshes.

| Station | Changes supported by the visible references | Remaining inferred geometry |
| --- | --- | --- |
| Caño Amarillo | Deep open concrete grille cells; framed precast bays; yellow space-frame nodes; roof daylight strips; track divider signage; plain platform edge | Screen material specification, bay pitch, column spacing and deck section |
| Capitolio | Widened stair vestibule behind the column line; fixed stairs beside escalators; pale tiled pier strip; yellow ticket-hall ceramics; ticket equipment | Recess dimensions, whole hall plan, location/length of the El Silencio passage |
| Bellas Artes | Island circulation; orange exit fascia; twin-tube luminaires; Avenida México portal with horizontal side louvres and semicircular steps | Full entrance-to-platform connection, precise portal footprint and other street entrances |
| Plaza Venezuela L1 | Colonnade; linear edge lamps and round inner lamps; pale El Valle / Línea 2 / Línea 3 transfer signs | Transfer shaft placement/depth, mezzanine dimensions; lower-line platforms are not reconstructed |
| Altamira | Bronze-toned escalators; terracotta wall fields; green exits; mezzanine railings; north plaza stairs, bridge and waterfall; curved south amphitheatre | Exact footprint, spacing, number of terraces and complete access network |

Additional original photographs retained under \`blender/references/\`:

- \`capitolio-03.jpg\`, \`capitolio-06.jpg\`, \`capitolio-07.jpg\`: [Dietmar Bothe, UrbanRail gallery 2](https://www.urbanrail.net/am/cara/pix/caracas-gallery2.htm).
- \`bellas-artes-02.jpg\`, \`bellas-artes-06.jpg\`, \`bellas-artes-09.jpg\`, \`bellas-artes-10.jpg\`, \`altamira-03.jpg\`, \`altamira-04.jpg\`, \`altamira-07.jpg\`, \`altamira-08.jpg\`: [Dietmar Bothe, UrbanRail gallery 1](https://www.urbanrail.net/am/cara/pix/caracas-gallery1.htm).
- \`plaza-venezuela-l1-01.jpg\`, \`plaza-venezuela-l1-02.jpg\`: [UrbanRail gallery 4](https://www.urbanrail.net/am/cara/pix/caracas-gallery4.htm); the captions explicitly identify Line 1.
- \`altamira-plaza-plan.png\`: [Guía Caracas, Plaza Francia](https://guiaccs.com/obras/plaza-francia/). This small site plan establishes the plaza axis perpendicular to the station. It is **not** a dimensioned station plan.
- \`altamira-south-amphitheatre.jpg\`: built-work photo composite reproduced in [Fundación Arquitectura y Ciudad](https://fundaayc.com/2024/07/14/algo-mas-sobre-la-postal-no-411/). The constructed curved terraces were used, rather than the unrealized angular proposal.

Platform datum is Y=1.1 m, mezzanine Y=5.1 m, and the modeled Altamira street
datum Y=9.1 m. The two 4 m offsets interpret the published Altamira description;
they are not survey evidence for the other stations. The 150 m platform
envelopes are retained; the current station/tunnel study replaces the old 160 m stop spacing with 510–550 m steps. See [STATION_ACCURACY_REVIEW.md](STATION_ACCURACY_REVIEW.md).

No authenticated dimensioned construction plans were found for all five
stations. Exact 1:1 parity therefore remains unverified. The models do not
include the complete surrounding city, every service room, every entrance,
or public art for which no sufficient geometric reference was inspected.

Use \`blender/rebuild_stations.py\` for station-only native updates. Its static
QA renders include five platforms, four concourses and three entrance views.
Those images can be inspected without leaving a server or Blender running.
`,Ne=`# Independent station and tunnel study · 7 September 2026

The playable asset and both inspection modes use the same native Blender
meshes. One unit is one metre. This pass preserves the photograph-supported
2012 appearance, improves the five stations separately, and provides a
shortened railway between them. It is not an as-built survey or a reconstruction
of every 2026 alteration.

## Plans searched and evidence actually found

Searches were made separately for each station using its name with plano,
planta, corte, arquitectura and its designers. Public network diagrams, city
CAD blocks, other cities' Bellas Artes/Altamira stations, and urban masterplans
are not station construction drawings. They were excluded. No authenticated,
dimensioned construction plan for all five stations was located.

- **Caño Amarillo:** Mario Bemergui's own [1992 paper](https://recyt.fecyt.es/index.php/CyTET/article/download/83795/61863/276024), printed pages 230–231 (PDF 12–13), was downloaded and visually inspected. Its aerial/access photographs show a long central roof opening, flanking hardscape and external stairs with substantial concrete parapets. The paper's circulation diagrams concern other stations; they were not applied to Caño Amarillo. The retained platform photograph supplies the yellow space frame and deep concrete screen grid. This pass opens the screens at the modeled access landings, adds the exterior stairs, supports and paved courts, and corrects the canopy to two broad roof fields around one longitudinal daylight strip. Access location, ground datum, bay pitch and plaza dimensions remain estimated.
- **Capitolio:** [Dietmar Bothe, UrbanRail gallery 2](https://www.urbanrail.net/am/cara/pix/caracas-gallery2.htm), photographs 03, 06 and 07, individually inspected. The platform stairs occupy a recess behind a pier, with a clear lane along the track. The concourse has a repeated exposed-concrete beam/pier structure, yellow glazed tile, fare equipment and an information kiosk. The new structure and kiosk follow these visible forms. The two side platforms are retained. Pier spacing, recess width and the exact El Silencio passage remain estimated; the transfer sign does not represent a complete passage model.
- **Bellas Artes:** [Bothe, UrbanRail gallery 1](https://www.urbanrail.net/am/cara/pix/caracas-gallery1.htm), photographs 02, 09 and 10. The island and central escalator are directly visible, as are the metal-clad circulation core, broad black/orange exit fascia and dark ceiling. Added structural cheeks and metal panels support the mezzanine; connected upper galleries replace a disconnected landing. The Avenida México portal is retained. Total hall width is interpreted as 18 m from the general station envelope; no Bellas Artes dimensioned plan was located. Core spacing and service spaces remain estimated.
- **Plaza Venezuela:** [Bothe, UrbanRail gallery 4](https://www.urbanrail.net/am/cara/pix/caracas-gallery4.htm), photographs 01–02 explicitly captioned **Línea 1**. Continuous edge-light channels, tiled column faces, round inner lights and pale transfer signs distinguish this hall. Those features were refined in this pass. The L1 side platforms and separate partial lower transfer pocket remain distinct. The L3 platform photo was excluded from the L1 model. Neither an authenticated L1 floor plan nor a complete interchange plan was located; lower levels and passage lengths are not claimed as reconstructed.
- **Altamira:** [Guía Caracas's Plaza Francia plan](https://guiaccs.com/obras/plaza-francia/) establishes the plaza axis perpendicular to the railway; it is an urban plan without usable station dimensions. The [architectural account](https://fundaayc.com/2024/07/14/algo-mas-sobre-la-postal-no-411/) reports 150 m typical stations and the mezzanine/platform 4/8 m below street. It describes concrete mezzanine trays within the taller hall. [Bothe's photographs 03, 04, 07–08](https://www.urbanrail.net/am/cara/pix/caracas-gallery1.htm) show the bronze escalators, orange-brown wall panels, green exits and glazed upper balustrades. Added deep tray beams, core support walls and connecting galleries strengthen that structure. The built curved south amphitheatre is retained rather than the unrealized angular sketch. Full entrance distribution, footprint and bay spacing remain estimated.

The native platform datums are Y=1.10 m and Z=stop−145…stop+5. This fits the
existing seven-car train. Platform heights and widths are modeling estimates.
Altamira's mezzanine/street are Y=5.10/9.10 m, preserving the reported 4 m
steps. The same level offsets used elsewhere are explicitly estimates.

## Tunnel section, with a primary engineering source

[Gianfranco Perri, *Historia y actualidad de los túneles en Venezuela*, XVIII
Seminario Venezolano de Geotecnia, 2004](https://gianfrancoperri.com/wp-content/uploads/2025/06/82-2004-historia-y-actualidad-de-los-tuneles-en-venezuela.pdf),
PDF pages 15–17, supplies the section and photographs. The paper was downloaded;
its ring, portal and Caño Amarillo photographs were visually inspected.

| Parameter | Model | Evidence |
| --- | --- | --- |
| Clear diameter at structural ribs | 5.16 m | Perri p.15 |
| Lining envelope thickness | 0.22 m | Perri p.15 |
| Ring pitch | 0.80 m | One of the documented 0.80/1.20 m variants |
| Segment arrangement | Six main pieces and crown key | Perri pp.15–16 |
| Ribbed/recessed concrete lining | Modeled as actual depth | Perri p.16 photograph and ring section |
| Running rail gauge | 1.435 m | Existing project railway datum |
| Bore-axis height | Y=1.80 m | Estimated against the existing train envelope |
| Cable benches, luminaires, drainage | Explicit meter geometry | Fitting size/spacing estimated |
| Separate bore spacing | At least 6.40 m | Modeling choice to prevent overlap |

This standard section is not asserted to occur at every actual chainage.
Perri p.19 specifically describes the special large mined tunnel between
Capitolio and La Hoyada: the standard twin-bore game sample is not a model of
that historic alignment. The photograph on p.22 establishes an open-air Metro
portal approach at Caño Amarillo; its exact terrain and portal position have
not been surveyed.

## Short route, physical cross sections

| Stop | Game stopping datum | Clear distance to next platform |
| --- | ---: | ---: |
| Caño Amarillo | 0 m | 360 m |
| Capitolio | 510 m | 400 m |
| Bellas Artes | 1060 m | 400 m |
| Plaza Venezuela L1 | 1610 m | 400 m |
| Altamira | 2160 m | 235 m tail tunnel |

The intermediate real stations and most real route length are omitted. Main
track stays straight for this playable sample. The return track uses smooth
55 m transitions between each platform arrangement and its separated bores;
these are covered double-track throats, not intersecting circular tubes.
Caño Amarillo has a 45 m open approach before a broad double-track arched mouth, distinguished in Perri p.22 from the adjacent old road tunnel. Its arch profile and dimensions remain estimates.

\`public/models/station-specs.json\` is the shared station/tunnel schedule, consumed
by Blender, exporter, loader, game data and review cameras. Changing only a
viewer scale cannot change the model. The loader rejects a stale stop schedule.

## Inspecting the result

Open \`/station-review.html\` or INSPECCIONAR ESTACIONES inside the simulator.
Each station has platform/detail views, a horizontal model cut under PLANTA,
a transverse cut under CORTE, and its departing railway under TÚNEL. A slider
in the standalone viewer moves through the tunnel at eye height. The plan's
50 m yellow ruler has 10 m divisions; these are views of the modeled geometry,
not mislabelled recovered construction plans. The evidence panel distinguishes
the sources and remaining uncertainties station by station.

Use \`blender/rebuild_stations.py\` to rebuild native station/tunnel collections
while preserving the authored train, then \`npm run export:blender\`. Native QA
renders live in \`blender/qa/\`; the web viewer loads the exported GLB itself.

## Verification of this export

Automated checks cover source/GLB hash parity, usable platform
floors at all five stops, internal bore radii sampled from exported faces,
longitudinal clearance at six points of the train envelope through every
tunnel/throat, camera placement in transit, and a full five-stop service.
Browser review independently inspected all five platform models, plan and
section cuts, and the tunnel sample. The in-game tunnel slider moved the view
to 220 m while the simulation stayed paused at 0 m; leaving inspection cleared
the section planes and restored the journey. Screenshots are retained as
\`blender/qa/web-station-study-1.jpg\` through \`5.jpg\`, \`web-study-section.jpg\`,
\`web-study-tunnel.jpg\` and \`web-study-driving.jpg\`. These checks establish
geometry and interaction behavior, not a measured real-time frame rate.

The environment export remains a substantial desktop-oriented asset. Hidden internal rib backs
were omitted and the circular tessellation reduced without changing the
nominal bore dimensions. The subsequent native material and fixture-lighting
pass is documented in [STATION_LIGHTING.md](STATION_LIGHTING.md), with actual
Cycles reviews in \`blender/qa/lighting/\` and separate real-time lighting checks.
`,Me=`# Blender reference rebuild

The current Blender source is a reference-led train approximation. It uses
the photographs and documents below as visual and dimensional anchors; it does
not claim a measured 1:1 reconstruction and it does not embed or redistribute
any reference photography as textures.

## Train references

- Local source-only reference copies: [\`caracas-caf-front.jpg\`](../blender/references/caracas-caf-front.jpg) and [\`caracas-caf-reference.jpg\`](../blender/references/caracas-caf-reference.jpg). These are kept outside public web assets.
- [Metro de Caracas Línea 1](https://commons.wikimedia.org/wiki/File:Metro_de_caracas_linea_1.jpg), Karlos Corbella, “Metro de Caracas2010”, CC BY-SA 3.0. Used for the silver CAF exterior, red cab surround, dark glazing, front lamps and the visible rainbow side band.
- [Bus América, Propatria 2011, PID 26432](https://bus-america.com/galeria/displayimage.php?pid=26432). Used as a side-profile reference for the repeated doors, windows and lower body details.
- [INECO 2013 report, pp. 36–39 (PDF pp. 18–19)](https://www.revistaitransporte.es/wp-content/uploads/2016/02/2013_49.pdf). Supports the CAF fleet context and inter-car gangway treatment.
- [Estructura y levante de caja, 161-200-05-602, June 2012](https://es.scribd.com/document/832322985/161-200-05-602-Estructura-y-levante-de-caja). A publicly hosted maintenance manual used as a secondary anchor for seven-car composition, two bogies per car, and an aluminium extruded welded body. The host is third party and the source was not treated as authenticated engineering data.
- [Testero delantero, 161-200-05-603, June 2012](https://es.scribd.com/document/832323381/161-200-05-603-Testero-delantero). The public reader's Figure 4-1 contains the front elevation, side profile, section A-A and exploded cab assembly. Those drawings, plus Figure 2-2's photograph, were inspected directly and used to rebuild the nose in \`blender/cab_geometry.py\`. The manual describes a moulded glass-fibre reinforced polyester front shell, distinct from the aluminium car body. It is a third-party copy of maintenance documentation, not an authenticated CAD release.
- [CAF presentation at the 2016 Electric Urban Mobility Forum, PDF p. 8](https://www.euskadi.eus/contenidos/evento/fm_capv_3/es_def/adjuntos/04_CAF_Fernando_Arizmendi_Imanol_Iturrioz.pdf). Manufacturer source confirming 48 seven-module Caracas units.
- [CAF Serie 6 renovado, May 2025](https://commons.wikimedia.org/wiki/File:CAF_Serie_6_renovado.jpg), FanMetroDeCaracas, CC0. Used only as an additional check of the curved cab silhouette; the model retains the 2010/2011 delivery livery.

The visible model changes are the continuous rounded silver shell, red cab mask,
single windshield wiper, deep glazing, four paired door bays per car, rainbow
lower sill band, two bogies with visible wheels, underframe equipment and low
roof pods. Dimensions and fine mechanical details remain estimates.

The side photograph anchors the continuous red roof-edge fascia and four lower
colour bands interrupted by solid red doors. The cab flag has the visible
valley/crest sweep and eight five-point stars. Open bogie frames expose the steel
wheelsets; detailed castings and equipment remain approximations.

### Body and side drawing pass

The body manual's Figure 2-3/2-4 elevations and Figure 2-21 cross-section were
inspected in the public ad-supported reader, along with Figure 2-19 through the
door openings. Source-only copies are retained as
[\`M and N/R elevations\`](../blender/references/body-elevations-2-3.jpg),
[\`complete body cross-section\`](../blender/references/body-cross-section-2-21.jpg),
and [\`door-zone cross-section\`](../blender/references/body-door-section-2-19.jpg).
These are additional drawings beyond the earlier nose/glazing references.

\`body_geometry.py\` traces the broad lower waist, inward-sloping upper sides and
curved roof shoulders. A shared perimeter joins this body to the cab, avoiding
the disconnected cap and large triangular highlight in the earlier model.
The side panels and glazing now follow that section instead of lying on flat
vertical planes. The elevation corrects the previously excessive door-window
height, and shows the small end windows on both ends of intermediate cars.

| Feature | Manual dimension | Model treatment |
| --- | --- | --- |
| N/R underframe | 20,460 mm, table 5-7 | Body extent ±10.230 m |
| M underframe | 20,473.5 mm, table 5-6 | Recorded reference; moulded nose extent remains traced |
| Bogie pivot centres | 15,250 mm, tables 5-6/5-7 | Centres at ±7.625 m |
| Structural door opening | 1,750 × 2,022.5 mm, table 5-8 | Door assembly sized to those dimensions |
| Main / end passenger glazing | 1,672 / 702 × 840 mm, window manual | Distinct full-size and small end windows |

Window seals and rebates, overhead door guides, grooved thresholds, lower
access seams and hinges, fascia fixings, small Metro markings and perimeter
bellows folds are native geometry. Roof ribs follow the cross-section; HVAC
dimensions and detailed running-gear fittings remain photo-based estimates.
The 2.20 m bogie wheelbase is scaled from the elevation, not a dimensioned
bogie drawing. Wheel tread centre positions are not the track-gauge dimension:
gauge is measured between the inner rail-head faces. No dimensions from other
CAF fleets were substituted as if they were Caracas specifications.

The estimated 0.50 m intercar gap gives a 20.96 m module pitch and approximately
148.05 m between the model's outermost parts. This is distinct from an exact
manufacturer coupler-to-coupler length. Passenger doors now move on user commands in the web export; wheels remain
static. See [EXTERIOR_MODEL.md](EXTERIOR_MODEL.md) for the exterior follow-up. The native source and exported assets use the same geometry. The
train is placed 3 m forward of the previous origin so its complete envelope
fits the 150 m platforms (-145 to +5 m relative to each stop marker).

The final cab replaces the near-vertical rounded rectangle with a bowed front
elevation, arched roof crown and a strongly curved longitudinal profile traced
from section A-A. The lower silver cheeks, separate destination glazing,
trapezoidal windshield outline and inset lamp covers follow the drawing. A
single constrained triangulation carries the front paint and glazing borders,
so independent curved panels cannot intersect or expose triangular artifacts.

Reference images inspected in the public reader are kept outside the web assets:
[\`front elevation and exploded view\`](../blender/references/testero-exploded-4-1.jpg),
[\`section A-A\`](../blender/references/testero-sections-4-1.jpg),
[\`cab profile\`](../blender/references/testero-figure-2-1.jpg),
[\`nose photograph\`](../blender/references/testero-figure-2-2.jpg),
[\`windshield outline\`](../blender/references/windshield-figure-2-2.jpg), and
[\`glazing photograph\`](../blender/references/windshield-figure-2-3.jpg).
These are reference material, not model textures. Overall dimensions and the
curve's absolute depth still require a measured drawing or survey to certify.

The provisional [window maintenance manual 161-311-05-601, June 2012](https://es.scribd.com/document/832322162/161-311-05-601-Ventanas) dimensions used as visual checks are
windshield 2.230 × 1.6225 m, indicator glass 1.957 × 0.5635 m, lamp cover
0.619 × 0.442 m, and passenger glass 1.672 × 0.840 m / 0.702 × 0.840 m.
They are source dimensions for selected parts, not a measured whole-train or
station scale claim.

## Station references

Station finishes and civic context follow [STATION_REFERENCES.md](STATION_REFERENCES.md)
and its linked primary/architectural references. The playable route uses five
stations at 0, 510, 1060, 1610 and 2160 m. Those distances are an artificial
compressed gameplay scale and are not survey kilometreage.

Local source-only station references include [\`Caño Amarillo\`](../blender/references/cano-amarillo-station.jpg), [\`Capitolio\`](../blender/references/capitolio-07.jpg), [\`Bellas Artes\`](../blender/references/bellas-artes-09.jpg), [\`Plaza Venezuela\`](../blender/references/plaza-venezuela-l1-01.jpg), and [\`Altamira\`](../blender/references/altamira-03.jpg). The files are reference material only and are never loaded by the browser.

## Asset identity

\`blender/metro_caracas_line1.blend\` is the native authored source. The web
export contains \`train.glb\` and \`environment.glb\`; the browser reads their
manifest source hash and collection metadata. The passenger saloons are
documented in [TRAIN_INTERIOR_REFERENCES.md](TRAIN_INTERIOR_REFERENCES.md).
Neither the train nor its interior is certified 1:1. Passenger doors now animate;
cab access doors and wheels remain static. See [EXTERIOR_MODEL.md](EXTERIOR_MODEL.md).
`,Oe=`# CAF Serie 6 exterior and door controls

The subsequent [independent exterior audit of 8 September 2026](EXTERIOR_AUDIT.md)
records remaining lighting, optical assembly, mechanical and marking issues.
Passing the checks below does not certify every exterior detail as accurate.

The playable simulator and \`/model-review.html\` load the same native Blender
export. This pass retains the Caracas CAF delivery appearance of 2010–2011.
It refines the cab windows and materials and makes the passenger doors operable.
It retains the passenger furniture design, stations and route geometry.

## Research reviewed on 7 September 2026

| Source | Provenance and useful evidence | Limits |
| --- | --- | --- |
| [CAF, Electric Urban Mobility Forum, 2 February 2016, slide 8](https://www.euskadi.eus/contenidos/evento/fm_capv_3/es_def/adjuntos/04_CAF_Fernando_Arizmendi_Imanol_Iturrioz.pdf) | Manufacturer presentation hosted by the Basque government; confirms 48 seven-module Caracas units. | Indexed text verified; direct PDF download timed out on this pass. No dimensioned cab surface or paint specification. |
| [INECO, itransporte 49, 2013, pp. 36–39](https://www.revistaitransporte.es/wp-content/uploads/2016/02/2013_49.pdf) | Primary report by the project engineers. PDF page 19 was rendered and visually inspected. The delivery photograph on printed p. 37 is explicitly credited to CAF. It shows the cab glazing, wiper, lamp covers, silver body, red paint, flag sweep and lower coupling. | This is an engineering project report and manufacturer photograph, not a vehicle CAD release. |
| [Metro de Caracas Línea 1 photograph](https://commons.wikimedia.org/wiki/File:Metro_de_caracas_linea_1.jpg) | Public image page, Karlos Corbella, CC BY-SA 3.0; high resolution delivery view already retained in \`blender/references/caracas-caf-front.jpg\`. | Photographic proportions vary with perspective; no color calibration. |
| [Propatria, 2011, Bus América PID 26432](https://bus-america.com/galeria/displayimage.php?pid=26432) | Public original side photograph, previously retained as \`caracas-caf-reference.jpg\`, visually rechecked. Shows red paired doors, the red roof-edge strip, dark window seals, small Metro markings and red/yellow/green/blue lower bands. | Publicly viewable does not mean public domain. Used as a reference, not a texture. |
| [161-311-05-601, Ventanas, Ed. 2, June 2012](https://es.scribd.com/document/832322162/161-311-05-601-Ventanas) | Public reproduction of the fleet maintenance manual. Describes flush curved laminated windshield glass with a black printed border; separate indicator and lamp glazing; side opening windows with a fixed lower pane. Figures 2-2/2-3 were rechecked against the photos. | Third-party upload, not authenticated by the manufacturer. The listed 2230 × 1622.5 mm windshield size is not assumed to be its projected vertical silhouette. |
| [161-200-05-603, Testero delantero](https://es.scribd.com/document/832323381/161-200-05-603-Testero-delantero) | Public manual reproduction; front elevation, section A-A and exploded assembly distinguish the moulded polyester/fibreglass nose, separate cab access doors and glazing. | No survey or original CAD control points; traced shapes remain estimates. |
| [161-200-05-602, Estructura y levante de caja](https://es.scribd.com/document/832322985/161-200-05-602-Estructura-y-levante-de-caja) | Public manual reproduction; body elevations and section 2-21 anchor the canted aluminium shell, four door bays, body openings and bogie spacing. Existing dimensional anchors are retained in \`BLENDER_REFERENCE_REBUILD.md\`. | Source authentication and whole-train dimensional certification remain unavailable. |
| [Inspección, ataque y fallas de puertas, 23 June 2023](https://www.scribd.com/document/679652090/Manual-Preventivo1) | Public trainee maintenance document explicitly describing the CAF fleet's electrically operated exterior sliding doors. | Training material, not a manufacturer mechanism drawing. It does not establish the model's exact clearance, travel curve or timing. |

Searches covered CAF's current and former sites, CAF Power & Automation,
operator material, engineering reports, cab/body/window manual identifiers,
and passenger/cab door documentation. No authenticated public vehicle CAD,
paint color schedule, full mechanical door linkage drawing or architectural
vehicle blueprint was found. Station architecture papers do not establish
rolling-stock dimensions and were not substituted for train drawings.
Refurbished liveries and other Caracas fleets were excluded from this pass.

## Exterior implementation

- The cab side panels invert the actual nose loft, including the roof
  shoulder's change in height. Each access door replaces a complete aperture
  in the cab shell. Its silver skin, 5 mm perimeter seam, 23 mm window frame,
  transparent panes and divider share one constrained triangulation. The
  rounded door profile surrounds the complete window with a silver reveal;
  corner radii preserve the upright rear and sloped front window edges.
  Seams use constant-width polygon offsets rather than centre scaling.
  Long boundary edges are sampled before surface mapping, so vertical seams
  and glazing frames follow the curved shell instead of spanning recessed
  straight chords. The catches follow the local surface orientation.
- The windshield's trapezoid and lower ceramic border follow the glass drawing.
  Its width is corrected to 2.230 m; the clear area uses transparent dielectric
  glass with a restrained neutral tint. The destination pane stays separate.
  The existing cab partition is trimmed inside the canted shoulder to remove
  its exposed white edge. Nose paint and glass retain a shared constrained triangulation so overlapping
  curved plates cannot expose triangular gaps.
- The nose and access doors use the same silver material as the body. Shared
  analytic normals keep the side reflection continuous at their join. The
  laminated glass has a lighter neutral tint and lower alpha, with a dielectric
  clear coat. The flag stays below/ahead of the side window, follows the shell
  within a few millimetres and meets the front stripes at the curved edge.
  Body silver, red paint, black ceramic frit, rubber and glass remain distinct.
  Color values, roughness and transparency are photographic rendering estimates,
  not manufacturer paint codes or measured optical transmission.

## Coupler correction — 8 September 2026

The exposed coupling assembly is rebuilt at both cab ends in
\`blender/coupler_geometry.py\`. The delivery photograph shows a machined face
with a projecting guide cone beside a hollow receiving cup. The former three
overlapping dark discs are replaced by separate turned surfaces, actual bores,
a thick cast housing and a supported longitudinal shank. The matching face is
about 0.51 m wide in this fitted reconstruction. The rear assembly is rotated
to preserve its handedness when viewed from outside either cab.

The lower nose now has a real opening through its front skin and underside,
with recessed returns and a drawgear bulkhead. The guard uses stacked channel
sections and mounting struts. A slender red handle attaches to a lower pivot;
the old angular red hose is removed. Flexible black and blue lines follow
continuous bends to fittings alongside the housing.

The visual source is the
[CAF delivery photograph](https://commons.wikimedia.org/wiki/File:Metro_de_caracas_linea_1.jpg),
also credited to CAF in INECO's report. Voith's
[description of the cone-and-cup coupling principle](https://www.voith.com/corp-en/voith-turbo-perspectives/mechanical-engineering-pioneers-at-voith-turbo.html)
supports the general assembly interpretation; it does not establish the
supplier or exact coupler model fitted to this Caracas train. Internal
mechanism, hose routing and installation dimensions remain photo-fitted
estimates. The model does not simulate mechanical coupling.

The exterior inspector includes an **ENGANCHE** close view at
\`/model-review.html?view=coupler\`. A native-GLB regression checks the projecting
cone, recessed socket and open nose on both ends, alongside the existing door
and cab-window regressions.

Verified against the rebuilt native file and web export: **60 tests passed**,
production build succeeded, and both couplers were inspected in the browser.
Source SHA-256: \`94f077602c7bafb6c17182412c8e5cfd9b560ef29c8cf0da55436966b5ebe157\`.
The open cab loft is clipped as a surface rather than using a solid boolean,
which prevents a reversed-cab cutter cap from covering the rear assembly.
Final captures: [front coupling](../blender/qa/web-coupler-exterior.jpg) and
[rear coupling](../blender/qa/web-coupler-rear.jpg).

## Cab crown closure — 8 September 2026

The narrow triangular opening at the top of each cab was a boundary mismatch:
the front triangulation inserted points along the curved crown while the roof
loft spanned that edge with a straight chord. The horizontal bow also collapsed
to an excessively tight radius at the top, pulling the centre forward.

The body section, cab loft and front now share a sampled perimeter. Their
boundary uses the same surface offset, and the horizontal bow transitions to
a finite radius above the destination panel. This closes the slit without
adding a cover plate. A regression sweeps 301 points over each cab crown and
checks for solid exterior skin and a continuous height profile; it fails on
the former export. Native geometry passes the same sweep before export.

The inspector's **TECHO DE CABINA** view at \`/model-review.html?view=roof\`
provides a direct view of this joint.

Validation: all 61 tests pass and the production build succeeds. Both exported
cab crowns were inspected in the browser: [front roof](../blender/qa/web-cab-roof.jpg)
and [rear roof](../blender/qa/web-rear-cab-roof.jpg). The export matches native
source SHA-256 \`eb69b50058d0a2c655bc544b1d6bf2baa3411047781192db8cb3e4601240b360\`.

## Door operation

The body and portal now have full-height openings. Every leaf is a native empty
with stable \`doorId\`, \`doorSide\`, \`doorTravelX\` and \`doorTravelZ\` metadata. Its red
skin, glass, gasket, meeting seal and existing inner skin remain children. The
exporter batches static meshes by material but never merges different leaves.
The GLB contains 112 leaf assemblies: 7 cars × 2 sides × 4 bays × 2 leaves.

\`src/train-doors.js\` drives a small outward clearance followed by paired slides
along the outside of the body. Each leaf travels 0.895 m longitudinally and
0.115 m outward; estimated opening/closing times are 2.4/2.8 seconds. These are
visual clearance and animation choices, not claimed CAF specifications. Closing
reverses the path and restores the exact authored transform. A reversed command
continues from the current pose without a jump.

The two driving cars have their own door layout. The former intermediate-car
spacing put the leading open passenger leaf over the cab access door. The
[driving-car elevation](../blender/references/body-elevations-2-3.jpg) shows a solid side panel
between these entrances. Driving-car door centres are now fitted at
−7.00, −2.55, 1.90 and 6.35 m relative to each car centre, toward its cab;
intermediate cars retain their existing positions. This moves the leading bay
0.65 m away from the cab and leaves about 0.10 m between the fully open leaf
and the cab-door perimeter. These station coordinates and the clearance are
model estimates, not manufacturer dimensions. Leaf width and full opening
travel are unchanged. Passenger windows, body cutouts, guide covers, thresholds,
lining and adjacent furniture positions follow the same layout, preserving
the complete opening and the existing seat count. Native door nodes export
\`doorCentreLocal\`, and the manifest records each car's layout.

In the game, **E** or the door button commands opening/closing. The initial train
is parked with its platform doors open. Opening requires a stopped train in the
station stop zone. The three-second boarding dwell is retained. Side platforms
use the left side of the modeled track; island platforms use the right. The
chosen side stays latched while closing. Traction remains blocked until the
last leaf closes. Pausing freezes the motion. Reopening before departure does
not count the same station twice. Stopping alone does not open the doors.

The exterior inspector has **ABRIR**, **CERRAR**, a side selector, **E**, and close
views for **VENTANA DE CABINA** and **PUERTAS**. It loads only the train asset.
The native Blender driving controller also preserves and moves the leaf parents.
Cab access doors and wheels remain static.

## Validation

\`test/train-doors.test.js\` exercises the real exported GLB: all leaf parents,
attached glass/inner skins, direction at the reversed driving car, pause,
command reversal, exact closure, and ray checks through every open doorway.
Additional rays check both cab side windows, including the upper corners and
lower front panes, and both windshields. The regression checks also verify
identical paint materials and continuous normals across the body/cab join,
and a silver reveal around each side window. Geometry checks also measure
the flush fit along the full door and window edges. Simulation
checks cover explicit commands, station-side selection, stop-zone restrictions
and reopening without duplicate service credit. Browser inspection checks the
same exported train with its visible controls.

A swept-envelope regression checks both sides of both driving cars throughout
opening and closing, requiring at least 50 mm clearance from the cab entrance.
The full-height doorway checks still require every passenger opening to clear.

Final validation: **59 tests passed**, the production build succeeded, the
native Blender door hierarchy check passed, and source/manifest hashes and
public/dist assets match. The unmodified environment asset was retained.
Browser checks exercised E, open/close buttons, pause during motion, reopening,
and rejection while moving; mobile door buttons remain within the viewport.
Final renderer captures: [exterior](../blender/qa/web-train-exterior.jpg),
[cab window](../blender/qa/web-cab-exterior.jpg),
[open doorway](../blender/qa/web-doors-open.jpg), and
[cab entrance with passenger doors open](../blender/qa/web-cab-doors-open.jpg). The final stills use explicit
redraws and deterministic animation advancement because the preview suspended
frames when hidden; they are not a frame-rate benchmark.
`,ue={color:"#d71920",realStationCount:22},Q=ue.color,_e=[{id:"cano-amarillo",name:"Caño Amarillo",distance:0,color:Q,type:"elevated",platformLayout:"side",railCenters:[0,4],interchange:null,detail:"Estación elevada junto al antiguo eje ferroviario Caracas–La Guaira, con cubierta reticulada amarilla y andenes laterales."},{id:"capitolio",name:"Capitolio",distance:900,color:Q,type:"subterránea",platformLayout:"side",railCenters:[0,4],interchange:"Conexión peatonal con El Silencio (Línea 2)",detail:"Estación profunda del centro con mezzanina y conexión peatonal hacia El Silencio."},{id:"bellas-artes",name:"Bellas Artes",distance:1800,color:Q,type:"subterránea",platformLayout:"island",railCenters:[0,10],interchange:null,detail:"Estación profunda con andén central bajo el eje cultural de Bellas Artes."},{id:"plaza-venezuela",name:"Plaza Venezuela",distance:2800,color:Q,type:"subterránea",platformLayout:"side",railCenters:[0,4],interchange:"Líneas 3 y 4 (conexiones del complejo)",detail:"Complejo de transferencia con niveles y pasillos de conexión de alta demanda."},{id:"altamira",name:"Altamira",distance:3900,color:Q,type:"subterránea",platformLayout:"island",railCenters:[0,10],interchange:null,detail:"Estación de tres niveles bajo la plaza y avenida Francisco de Miranda, con andén central y mezzanina."}],pe=_e.map((p,w)=>({...p,...me.stations[w]}));function Fe(p,w,u=[],h){if(!(h!=null&&h.train)||!(h!=null&&h.environment))throw new Error("Los modelos Blender aún no están disponibles.");const a=new p.Scene,o=we(a,w,h.manifest),T=ve(a);a.fog=new p.Fog(1581354,260,900);const v=new p.Group;v.name="Caracas Metro L1 · Blender export",a.add(v);const y=h.environment;y.name="Blender environment · five stops",v.add(y),se(y,w);const t=[];y.traverse(i=>{!i.isMesh&&i.userData.sourceCollection&&t.push(i)});const E=u.map(i=>t.find(A=>A.userData.sourceCollection===i.collection));if(E.some(i=>!i))throw new Error("Falta una estación Blender en el entorno del juego.");const c=h.train;c.name="Blender train · 7 cars",v.add(c),se(c,w),c.traverse(i=>{if(i.isMesh){const A=Array.isArray(i.material)?i.material:[i.material];i.castShadow=A.some(d=>!d.transparent)}});const x=Ee(c,Se),s={forward:new p.PerspectiveCamera(70,1,.05,1200),exterior:new p.PerspectiveCamera(68,1,.1,900),platform:new p.PerspectiveCamera(68,1,.1,900),inspection:new p.PerspectiveCamera(68,1,.2,700),interior:new p.PerspectiveCamera(72,1,.035,700)},j=xe(c,s.interior,w,h.manifest),G=ke(c);let C="platform",l=null,b=0,S=0;const g=w?new he(s.inspection,w.domElement):null,z=ye({camera:s.inspection,controls:g,environment:y});g&&(g.enabled=!1,g.enableDamping=!1,g.addEventListener("change",()=>{z.adjusting||(z.constrain(),b++)}));const I=()=>l?s.inspection:s[C];function Z(i){return C=["forward","exterior","platform","interior"].includes(i)?i:"platform",b++,I()}function M(i=S,A="platform"){i=Math.max(0,Math.min(u.length-1,Number(i)||0));const d=ce(i,A,s.inspection.aspect);l={index:i,...d};for(const N of t)N.visible=d.collections.includes(N.userData.sourceCollection);le(w,d),T.show(i,d.kind);const m=u[i].distance;return c.visible=["platform","detail","concourse"].includes(d.kind)&&c.position.z>=m-148&&c.position.z<=m+150,g&&(g.enabled=!0),z.setView(i,d),o.focus(s.inspection.position,d.collection,d.exterior,["plan","section"].includes(d.kind)),b++,l}function W(){l=null,le(w,{}),T.hide(),g&&(g.enabled=!1),z.clear(),t.forEach(i=>{i.visible=!0}),c.visible=!0,b++}function ee(i){(l==null?void 0:l.kind)!=="tunnel"||!Number.isFinite(Number(i))||(z.moveTunnel(i),o.focus(s.inspection.position,l.collection),b++)}function H(i=.016,A=0,d={}){c.position.set(0,0,Number(A)||0),x.update(i,d),G.update(d,x.fraction);const m=c.position.z;s.forward.position.set(0,2.5,m+5),s.forward.lookAt(0,2,m+15);const N=j.cars[j.state.carIndex-1],f=C==="interior"&&N?m+N.center+N.direction*j.state.travel:C==="platform"?m-84:m+4.6;S=u.findIndex(L=>f<=L.distance+5),S<0&&(S=u.length-1);const R=u[S],X=(L,_)=>L>=_.distance-144&&L<=_.distance+4,D=X(f,R),ae=["Bellas Artes","Altamira"].includes(R==null?void 0:R.name),B=ae?2.5:(R==null?void 0:R.name)==="Capitolio"?-2.65:-3.9;s.platform.position.set(D?B:0,2.73,D?m-84:m+5),s.platform.lookAt(D?B:0,2.98,D?m-69:m+23);const te=u.some(L=>X(m+4.6,L));if(s.exterior.position.set(te?ae?7.5:B:0,2.73,m+4.6),s.exterior.lookAt(0,2.1,te?m-4:m+22),j.update(m,C==="interior"&&!l,I().position.z),l)z.constrain(),o.focus(s.inspection.position,l.collection,l.exterior,["plan","section"].includes(l.kind));else{const L=I().position.clone(),_=u.find(F=>L.z>=F.distance-145&&L.z<=F.distance+5),J=Math.max(0,u.findLastIndex(F=>L.z>F.distance+5)),Y=C==="interior"&&!["operator","cab-seat"].includes(j.state.view);o.focus(L,(_==null?void 0:_.collection)||`Tunnel ${u[J].id}`,!1,!1,Y)}}function $(i,A){if(Object.values(s).forEach(d=>{d.aspect=i/Math.max(1,A),d.updateProjectionMatrix()}),(l==null?void 0:l.kind)==="plan"){const{index:d}=l,m=ce(d,"plan",s.inspection.aspect);l={index:d,...m},z.setView(d,m)}else z.constrain();b++}function K(){v.traverse(i=>{var A;i.geometry&&i.geometry.dispose(),(A=i.material)!=null&&A.dispose&&i.material.dispose()}),g==null||g.dispose(),z.dispose(),o.dispose(),j.dispose(),G.dispose(),T.dispose()}return{scene:a,root:v,train:c,cameras:s,get camera(){return I()},get inspection(){return l},get activeStation(){return S},get renderRevision(){return b+j.revision+x.revision+G.revision},get doorFraction(){return x.fraction},doors:x,setCameraMode:Z,inspectStation:M,leaveInspection:W,moveTunnel:ee,update:H,resize:$,dispose:K,controls:g,stationAssemblies:E,railPaths:[],lighting:o,interior:j,cab:G,cameraGuard:z,assetSource:h.source,manifest:h.manifest}}function De(p=[],{routeEnd:w=1/0}={}){var v,y;const u=((v=p[0])==null?void 0:v.distance)??0,h=Math.max(((y=p.at(-1))==null?void 0:y.distance)??u,w);let a;const o=()=>{var t;return{position:u,speed:0,target:0,doorsOpen:!0,doorSide:((t=p[0])==null?void 0:t.platformLayout)==="island"?1:-1,doorStation:0,lastServed:-1,dwell:3,started:!1,missed:!1,complete:!1,paused:!1,score:100,serviceCount:0}};return a=o(),{get state(){return{...a}},start(){return a.started=!0,this},reset(){return a=o(),a.started=!0,this},pause(t=!a.paused){return a.paused=t,this},setDoors(t){if(t=!!t,t===a.doorsOpen)return this.state;const E=a.doorsOpen?a.doorStation:p.findIndex((x,s)=>(s===a.target||s===a.lastServed)&&Math.abs(a.position-x.distance)<=12),c=p[E];return a.paused||a.speed>.04||!c||Math.abs(a.position-c.distance)>12||a.missed||a.complete?this.state:(t?(a.doorsOpen=!0,a.doorStation=E,a.doorSide=c.platformLayout==="island"?1:-1,a.dwell=E>a.lastServed?3:0):a.dwell<=0&&(a.doorsOpen=!1,E>a.lastServed&&(a.serviceCount++,a.lastServed=E,a.target===p.length-1?a.complete=!0:a.target++)),this.state)},toggleDoors(){return this.setDoors(!a.doorsOpen)},recover(){const t=p[a.target];return!t||a.complete||!a.missed?this.state:(a.position=t.distance,a.speed=0,a.doorsOpen=!0,a.doorStation=a.target,a.doorSide=t.platformLayout==="island"?1:-1,a.dwell=3,a.missed=!1,a.score=Math.max(0,a.score-15),this.state)},tick(t,E={}){if(!a.started||a.paused||a.complete)return this.state;const c=Math.min(Math.max(Number(t)||0,0),.05);a.doorsOpen&&(a.dwell=Math.max(0,a.dwell-c));const x=!!E.throttle&&!a.doorsOpen&&!a.missed;E.emergency?a.speed=Math.max(0,a.speed-3*c):E.brake?a.speed=Math.max(0,a.speed-2.5*c):x?a.speed=Math.min(18,a.speed+1.15*c):a.speed=Math.max(0,a.speed-.22*c),a.position+=a.speed*c,a.position>=h&&(a.position=h,a.speed=0);const s=p[a.target];return s&&a.position>s.distance+12&&!a.missed&&(a.missed=!0,a.score=Math.max(0,a.score-20)),this.state}}}async function Be(){var ne;const p=document.querySelector("#app");p.innerHTML='<div class="asset-loading" role="status"><div class="asset-loading-mark">M</div><div class="asset-loading-title">Cargando exportación Blender</div><div class="asset-loading-detail" id="assetLoadingDetail">Validando manifest.json…</div></div>';let w;try{w=await ge({onProgress:(e,r)=>{const n=document.querySelector("#assetLoadingDetail");n&&(n.textContent=`${e} · ${Math.round(r*100)}%`)}})}catch(e){const r=String((e==null?void 0:e.message)||e);throw p.innerHTML=`<div class="asset-error" role="alert"><div class="asset-loading-mark">!</div><h1>No se pudo abrir el mundo Blender</h1><p>${r.replace(/[&<>]/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[n])}</p><p>Comprueba que <code>public/models/blender/manifest.json</code>, <code>train.glb</code> y <code>environment.glb</code> estén publicados y vuelve a cargar.</p><button onclick="location.reload()">REINTENTAR</button></div>`,e}const u=(Array.isArray(pe)?pe:[]).map((e,r)=>{var n;return{...e,...w.manifest.stations[r]||{},distance:Number(((n=w.manifest.stations[r])==null?void 0:n.distance)??e.distance)}});p.replaceChildren();const h=new fe({antialias:!0,powerPreference:"low-power"});Ae(h),h.setSize(innerWidth,innerHeight),p.append(h.domElement);const a=Fe(be,h,u,w);a.resize(innerWidth,innerHeight);const o=De(u,{routeEnd:de(u.length-1).max-5}),T=Re({stops:u});window.__metro={world:a,sim:o,audio:T,renderer:h,assetSource:w.source,manifest:w.manifest,assetsReady:!0};const v=document.createElement("div");v.className="ui",v.innerHTML=`
<div class="topbar"><div class="brand"><i>M</i><span>Metro de Caracas</span></div><div class="route-title">Línea 1 · dirección Altamira</div><div class="clock" id="clock">06:42:18</div></div>
<div class="route-panel"><div class="route-label">Recorrido · ${u.length} estaciones</div><div class="station-list" id="stationList"></div></div>
<div class="next"><div class="route-label">Objetivo</div><strong id="next">Caño Amarillo</strong><span id="distance">PUERTAS ABIERTAS</span></div>
<div class="mode" id="mode">PUERTAS / EMBARQUE</div>
<div class="progress"><b id="progress"></b></div>
<div class="bottom"><div class="hint"><kbd>W</kbd>/<kbd>↑</kbd> tracción &nbsp; <kbd>S</kbd>/<kbd>↓</kbd> freno &nbsp; <kbd>E</kbd> puertas &nbsp; <kbd>Espacio</kbd> emergencia</div><div class="meters"><div class="lever"><button data-a="brake">FRENO</button><button data-a="throttle">TRACCIÓN</button><button data-a="emergency">EMERGENCIA</button></div><div class="speed"><strong id="speed">00</strong><small> km/h</small><div class="bar"><b id="speedbar"></b></div></div></div></div>
<div class="controls"><button id="doors">PUERTAS</button><button id="pause">PAUSA</button><button id="camera">VISTA: EXTERIOR</button><button id="inspect" class="inspect">INSPECCIONAR TREN</button><button id="inspectStations" class="inspect">INSPECCIONAR ESTACIONES</button><button id="recover">RECUPERAR</button><button id="reset">REINICIAR</button><button id="sound">SONIDO</button><label title="Volumen del audio">VOL <input id="volume" type="range" min="0" max="100" value="65" aria-label="Volumen"></label><button id="share">COMPARTIR</button><button id="sources">FUENTES</button></div>
<div class="toast" id="toast"></div>
<div class="overlay" id="intro"><div class="card"><div class="corner">SIMULADOR 01 / CABINA</div><div class="eyebrow">Servicio de pasajeros · turno mañana</div><h1>Línea 1<br>en marcha.</h1><p>Conduce el tren desde Caño Amarillo hasta Altamira. Detente dentro de la zona de parada, abre puertas durante tres segundos y continúa.</p><button class="start" id="start">Abrir cabina</button><button class="secondary" id="inspectIntro">INSPECCIONAR TREN</button><button class="secondary" id="inspectStationsIntro">INSPECCIONAR ESTACIONES</button><p class="fine">Cinco estaciones, andenes de 150 m y túneles para conducir. Recorrido abreviado de 2,16 km. La línea histórica completa tiene ${ue.realStationCount} estaciones.</p></div></div>
<div class="overlay" id="complete" style="display:none"><div class="card"><div class="eyebrow">Servicio finalizado</div><h1>Altamira</h1><p>Has servido las ${u.length} estaciones de este recorrido.</p><p class="scoreline">Puntuación <strong id="finalScore">100</strong></p><button class="start" id="restart">REINICIAR SERVICIO</button><button class="secondary" id="completeSources">VER FUENTES</button></div></div>
<div class="overlay" id="sourceModal" style="display:none"><div class="card source-card"><button class="corner" id="closeSources">CERRAR ×</button><div class="eyebrow">Documentación</div><h1>Fuentes</h1><p>Investigación sobre diseño, estaciones, trenes y mecánica de la Línea 1. Fuentes primarias consultadas:</p><div class="source-links"><a href="https://openjicareport.jica.go.jp/pdf/11789237_03.pdf" target="_blank" rel="noreferrer">JICA · datos de línea</a><a href="https://www.aschinfraestructuras.com/linea-caracas" target="_blank" rel="noreferrer">ASCH · rehabilitación de vía</a><a href="https://admin.cafmobility.com/uploads/281_CAF_Catalogo_General_ES_601604d06c.pdf" target="_blank" rel="noreferrer">CAF · catálogo</a><a href="https://www.revistaitransporte.es/wp-content/uploads/2016/02/2013_49.pdf" target="_blank" rel="noreferrer">INECO · tren CAF y rehabilitación</a><a href="https://www.alstom.com/fr/press-releases-news/2005/9/ALSTOM-remporte-un-contrat-cle-en-main-pour-le-Metro-de-Caracas-au-Venezuela-20050916" target="_blank" rel="noreferrer">Alstom · Metro de Caracas</a><a href="https://www.urbanrail.net/am/cara/pix/caracas-gallery1.htm" target="_blank" rel="noreferrer">UrbanRail · Altamira y Bellas Artes</a><a href="https://www.urbanrail.net/am/cara/pix/caracas-gallery2.htm" target="_blank" rel="noreferrer">UrbanRail · Capitolio</a><a href="https://www.urbanrail.net/am/cara/pix/caracas-gallery4.htm" target="_blank" rel="noreferrer">UrbanRail · Plaza Venezuela</a><a href="https://fundaayc.com/2024/07/14/algo-mas-sobre-la-postal-no-411/" target="_blank" rel="noreferrer">Fundación Arquitectura y Ciudad · Altamira</a><a href="https://recyt.fecyt.es/index.php/CyTET/article/download/83795/61863/276024" target="_blank" rel="noreferrer">Bemergui · arquitectura de estaciones</a></div><p><small>El audio del juego utiliza únicamente grabaciones con procedencia verificada. Consulta aquí los archivos disponibles y sus fuentes.</small></p><button class="secondary" id="realListen">VER GRABACIÓN CAF/ALSTOM</button><iframe id="realFrame" title="Referencia real del Metro de Caracas" style="display:none;width:100%;aspect-ratio:16/9;border:0;margin-top:1rem" allow="autoplay; encrypted-media" allowfullscreen></iframe><div id="audioSources"></div><pre id="researchText"></pre><pre id="stationResearchText"></pre></div></div>`,p.append(v);const y=document.createElement("section");y.className="station-review-ui in-game-stations",y.hidden=!0,y.setAttribute("aria-label","Explorar estaciones"),y.innerHTML='<button id="returnToGame" class="back-link">← VOLVER A CONDUCIR</button><div class="review-kicker">EXPLORAR ESTACIÓN · JUEGO EN PAUSA</div><h1 id="gameStationTitle"></h1><p id="gameStationDetail"></p><label>ESTACIÓN <select id="gameStationSelect" aria-label="Estación para explorar"></select></label><div class="review-actions"><button data-station-view="platform">ANDÉN</button><button data-station-view="detail">DETALLE</button><button data-station-view="concourse">MEZZANINA</button><button data-station-view="entrance">ACCESO</button><button data-station-view="south">PLAZA SUR</button><button data-station-view="plan">PLANTA</button><button data-station-view="section">CORTE</button><button data-station-view="tunnel">TÚNEL</button></div><p id="gameStationMetrics" class="station-metrics"></p><label id="gameTunnelTravelLabel" hidden>RECORRER TÚNEL <input id="gameTunnelTravel" type="range" step="1" aria-label="Recorrer túnel en metros"></label><p class="review-hint">Planta y corte: geometría del modelo en metros; medidas de estación estimadas.</p><p class="review-hint">Arrastra para mirar · rueda para acercarte.<br>Tu recorrido se conserva. Esc para volver.</p>',v.append(y);const t=e=>v.querySelector("#"+e),E=t("stationList");u.forEach((e,r)=>{const n=document.createElement("div");n.className="station",n.textContent=e.name,n.dataset.i=r,E.append(n)}),t("researchText").textContent=Pe,t("stationResearchText").textContent=Ne+`

`+je;const c=document.createElement("pre");c.textContent=`${Oe}

${Me}`,t("stationResearchText").before(c);const x=document.createElement("a");x.href="https://commons.wikimedia.org/wiki/File:Metro_de_caracas_linea_1.jpg",x.target="_blank",x.rel="noopener noreferrer",x.textContent="CAF Serie 6 · fotografía original usada para el modelo",v.querySelector(".source-links").prepend(x),t("audioSources").textContent=Le.authenticity,ze.forEach(e=>{const r=document.createElement("a");r.href=e.url,r.target="_blank",r.rel="noopener noreferrer",r.textContent=`${e.title} — ${e.creator}`,r.style.display="block",t("audioSources").append(r)});const s=document.createElement("details"),j=document.createElement("summary");j.textContent="ESCUCHAR LOS 17 FRAGMENTOS DEL JUEGO",s.append(j);const G={idle:"Tren detenido",rolling:"Rodadura en túnel",traction:"Salida del CAF",braking:"Frenado del CAF","brake-release":"Final de la parada","doors-open":"Apertura de puertas","doors-close":"Aviso y cierre de puertas"};for(const[e,r]of Object.entries(Ie.clips)){const n=u.find(U=>e.endsWith(U.id)),q=G[e]||`${e.startsWith("arrival-")?"Anuncio":"Ambiente"} · ${(n==null?void 0:n.name)||e}`,k=document.createElement("div");k.className="audio-recording";const P=document.createElement("div");P.textContent=q;const O=document.createElement("audio");O.controls=!0,O.preload="none",O.src=r.url,O.setAttribute("aria-label",q),O.addEventListener("play",()=>{s.querySelectorAll("audio").forEach(U=>{U!==O&&U.pause()}),t("realFrame").src="",t("realFrame").style.display="none"});const V=document.createElement("a");V.href=`https://www.youtube.com/watch?v=${r.source}&t=${Math.floor(r.start)}s`,V.target="_blank",V.rel="noopener noreferrer",V.textContent="Ver fragmento original ↗",k.append(P,O,V),s.append(k)}t("audioSources").append(s),t("realListen").onclick=()=>{s.querySelectorAll("audio").forEach(e=>e.pause()),t("realFrame").src="https://www.youtube-nocookie.com/embed/Ej0X90zrtNg",t("realFrame").style.display="block"};let C=!1,l=!1,b=!1,S=0;const g=["platform","exterior","forward","interior"],z={platform:"ANDÉN",exterior:"EXTERIOR",forward:"MARCHA",interior:"INTERIOR"};t("camera").textContent="VISTA: ANDÉN";let I=!1,Z=!1,M=!1,W=!1,ee=!1;const H=t("gameStationSelect");u.forEach((e,r)=>{const n=document.createElement("option");n.value=r,n.textContent=e.name,H.append(n)});function $(e=a.activeStation,r="platform"){a.inspection||(ee=o.state.paused,R(!1),b=!1,o.pause(!0));const n=a.inspectStation(e,r),q=Ce[n.index];H.value=n.index,t("gameStationTitle").textContent=q.name,t("gameStationDetail").textContent=q.detail,t("gameStationMetrics").textContent=Te(n.index,n.kind),t("gameTunnelTravelLabel").hidden=n.kind!=="tunnel";const k=de(n.index);t("gameTunnelTravel").min=k.min,t("gameTunnelTravel").max=k.max,t("gameTunnelTravel").value=a.camera.position.z,y.querySelectorAll("[data-station-view]").forEach(P=>{P.hidden=!n.views.includes(P.dataset.stationView),P.classList.toggle("active",P.dataset.stationView===n.kind),P.setAttribute("aria-pressed",P.dataset.stationView===n.kind)}),y.hidden=!1,i.hidden=!0,v.classList.add("station-inspecting")}function K(){a.leaveInspection(),y.hidden=!0,v.classList.remove("station-inspecting"),i.hidden=g[S]!=="interior",o.pause(ee)}H.onchange=()=>$(Number(H.value)),y.querySelectorAll("[data-station-view]").forEach(e=>{e.onclick=()=>$(a.inspection.index,e.dataset.stationView)}),t("returnToGame").onclick=K,t("gameTunnelTravel").oninput=e=>{a.moveTunnel(e.target.value),e.target.value=a.camera.position.z};const i=document.createElement("section");i.className="interior-controls",i.hidden=!0,i.setAttribute("aria-label","Interior del tren"),i.innerHTML='<div class="route-label">Interior · CAF Serie 6</div><label>COCHE <select id="interiorCar" aria-label="Coche del tren"></select></label><div class="interior-presets"><button data-interior-view="saloon">SALÓN</button><button data-interior-view="seats">ASIENTOS</button><button data-interior-view="doors">PUERTAS</button><button data-interior-view="gangway">INTERCONEXIÓN</button><button data-interior-view="operator">PUESTO DEL OPERADOR</button><button data-interior-view="cab-seat">ASIENTO DEL OPERADOR</button></div><label id="interiorTravelLabel">RECORRER COCHE <input id="interiorTravel" type="range" min="-9.6" max="7.6" step=".01" value="6.63" aria-label="Posición dentro del coche"></label><p>Arrastra para mirar alrededor.<br>W / S controlan el tren · E abre o cierra puertas.</p>',v.append(i);for(let e=1;e<=7;e++){const r=document.createElement("option");r.value=e,r.textContent=`${e} · ${e===1||e===7?"Extremo":"Intermedio"}`,t("interiorCar").append(r)}function A(e="saloon"){a.interior.select(Number(t("interiorCar").value),e),t("interiorCar").value=a.interior.state.carIndex,t("interiorTravelLabel").hidden=["operator","cab-seat"].includes(e),t("interiorTravel").value=a.interior.state.travel,i.querySelectorAll("[data-interior-view]").forEach(r=>{r.classList.toggle("active",r.dataset.interiorView===e),r.setAttribute("aria-pressed",r.dataset.interiorView===e)})}t("interiorCar").onchange=()=>A(),t("interiorTravel").oninput=e=>a.interior.move(e.target.value),i.querySelectorAll("[data-interior-view]").forEach(e=>{e.onclick=()=>A(e.dataset.interiorView)});function d(e){S=e,a.setCameraMode(g[e]),t("camera").textContent=`VISTA: ${z[g[e]]}`,i.hidden=g[e]!=="interior"}const m=document.createElement("button");m.id="enterInterior",m.className="inspect",m.textContent="INTERIOR DEL TREN",m.onclick=()=>{d(3),A()},t("camera").after(m);const N=document.createElement("button");N.className="secondary",N.textContent="VER INTERIOR",N.onclick=()=>{o.start(),t("intro").style.display="none",d(3),A()},t("inspectIntro").after(N);function f(e){t("toast").textContent=e,t("toast").classList.add("show"),clearTimeout(f.timer),f.timer=setTimeout(()=>t("toast").classList.remove("show"),1700)}function R(e=!1){C=e,l=e}function X(){if(M||a.inspection)return;const e=o.state,r=o.toggleDoors();e.doorsOpen!==r.doorsOpen?f(r.doorsOpen?"Abriendo puertas del andén":"Cerrando puertas"):e.paused?f("Continúa el servicio para accionar las puertas"):e.speed>.04?f("Detén el tren para abrir las puertas"):e.dwell>0?f("Espera el embarque"):f("Fuera de zona de parada")}function D(){M||(R(!1),b=!1,Z=o.state.paused,o.pause(!0),T.update(0,{...o.state,paused:!0}),M=!0,t("sourceModal").style.display="grid")}function ae(){M&&(M=!1,t("sourceModal").style.display="none",s.querySelectorAll("audio").forEach(e=>{e.pause(),e.currentTime=0}),t("realFrame").src="",t("realFrame").style.display="none",o.pause(Z))}function B(){a.inspection&&K(),R(!1),b=!1,d(0),T.reset();const e=o.reset();return t("intro").style.display="none",t("complete").style.display="none",W=!1,f("Servicio reiniciado"),e}function te(e){if(a.inspection){e.code==="Escape"&&(e.preventDefault(),K());return}M||e.repeat||!o.state.started||e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement||e.target instanceof HTMLTextAreaElement||!["KeyW","ArrowUp","KeyS","ArrowDown","Space","KeyE","KeyC","KeyP","KeyR"].includes(e.code)||(e.preventDefault(),(e.code==="KeyW"||e.code==="ArrowUp")&&(C=!0),(e.code==="KeyS"||e.code==="ArrowDown")&&(l=!0),e.code==="Space"&&(b=!0,f("Freno de emergencia")),e.code==="KeyE"&&X(),e.code==="KeyC"&&d((S+1)%g.length),e.code==="KeyP"&&(o.pause(),f(o.state.paused?"Pausa":"Continuar")),e.code==="KeyR"&&B())}function L(e){(e.code==="KeyW"||e.code==="ArrowUp")&&(C=!1),(e.code==="KeyS"||e.code==="ArrowDown")&&(l=!1)}addEventListener("keydown",te),addEventListener("keyup",L),addEventListener("blur",()=>{R(!1),b=!1,o.pause(!0),T.update(0,o.state)}),document.addEventListener("visibilitychange",()=>{document.hidden&&(R(!1),b=!1,o.pause(!0),T.update(0,{...o.state,hidden:!0}))}),addEventListener("pagehide",()=>T.update(0,{...o.state,hidden:!0})),t("start").onclick=()=>{o.start(),t("intro").style.display="none",f("Caño Amarillo · servicio listo")},t("doors").onclick=X,t("pause").onclick=()=>{o.pause(),f(o.state.paused?"Pausa":"Continuar")},t("recover").onclick=()=>{o.recover(),f("Tren recuperado · penalización aplicada")},t("reset").onclick=B,t("camera").onclick=()=>{d((S+1)%g.length)},t("inspect").onclick=()=>{window.location.href="/model-review.html"},t("inspectIntro").onclick=()=>{window.location.href="/model-review.html"},t("inspectStations").onclick=()=>{$()},t("inspectStationsIntro").onclick=()=>{$()},t("sound").setAttribute("aria-pressed","false"),t("sound").onclick=async()=>{const e=!I;I=e,t("sound").textContent=e?"CARGANDO AUDIO…":"SONIDO",t("sound").setAttribute("aria-pressed",String(e)),await T.setEnabled(e);const r=T.status();I=r.enabled,t("sound").textContent=r.loading?"CARGANDO AUDIO…":I?"SONIDO ON":"SONIDO",t("sound").setAttribute("aria-pressed",String(I)),e&&!r.loading&&!I?f(r.error||(r.total?"No se pudo cargar el audio. Pulsa SONIDO para reintentar.":"Grabaciones originales pendientes · consulta FUENTES")):I&&r.failed.length&&f("Algunas grabaciones no se pudieron cargar. Vuelve a activar SONIDO para reintentar.")},t("volume").oninput=e=>T.setVolume(e.target.value),t("sources").onclick=D,t("share").onclick=async()=>{const e={title:"Metro de Caracas · Línea 1",text:"Conduce el Metro de Caracas desde Caño Amarillo hasta Altamira.",url:window.location.href};try{navigator.share?await navigator.share(e):(await navigator.clipboard.writeText(window.location.href),f("Enlace copiado"))}catch(r){(r==null?void 0:r.name)!=="AbortError"&&f("Copia el enlace del navegador")}},t("completeSources").onclick=D,t("closeSources").onclick=ae,t("restart").onclick=B,document.querySelectorAll("[data-a]").forEach(e=>{const r=()=>{M||a.inspection||(e.dataset.a==="throttle"&&(C=!0),e.dataset.a==="brake"&&(l=!0),e.dataset.a==="emergency"&&(b=!0,f("Freno de emergencia")))},n=()=>{e.dataset.a==="throttle"&&(C=!1),e.dataset.a==="brake"&&(l=!1)};e.onpointerdown=r,e.onpointerup=n,e.onpointercancel=n,e.onpointerleave=n});const _=((ne=u.at(-1))==null?void 0:ne.distance)||1;let J=performance.now(),Y="";function F(e){var re;if(document.hidden){J=e,requestAnimationFrame(F);return}const r=Math.min((e-J)/1e3,.05);J=e;const n=o.tick(r,{throttle:C&&a.doorFraction<.001,brake:l,emergency:b});n.speed<=.01&&(b=!1),a.update(n.paused?0:r,n.position,{doorsOpen:n.doorsOpen,doorSide:n.doorSide,speed:n.speed,throttle:C,brake:l,emergency:b});const q=a.doorFraction<.001;T.update(r,{...n,throttle:C&&q,brake:l,emergency:b,cameraMode:g[S]});const k=u[n.target],P=Math.round(n.speed*3.6);t("speed").textContent=String(P).padStart(2,"0"),t("speedbar").style.width=Math.min(100,P/65*100)+"%",t("progress").style.width=Math.min(100,n.position/_*100)+"%",t("clock").textContent=new Date().toLocaleTimeString("es-VE",{hour12:!1}),t("next").textContent=n.complete?((re=u.at(-1))==null?void 0:re.name)||"—":(k==null?void 0:k.name)||"—",t("distance").textContent=n.missed?"PARADA OMITIDA · RECUPERAR":n.complete?"FIN DE LÍNEA":n.doorsOpen?`EMBARQUE · ${Math.ceil(n.dwell)} s`:`${Math.max(0,Math.round(((k==null?void 0:k.distance)||0)-n.position))} m · ${n.score} PTS`,t("doors").textContent=a.doors.warning?"AVISO DE CIERRE…":a.doors.moving?n.doorsOpen?"ABRIENDO PUERTAS…":"CERRANDO PUERTAS…":n.doorsOpen?"CERRAR PUERTAS · E":"ABRIR PUERTAS · E",t("pause").textContent=n.paused?"CONTINUAR":"PAUSA",t("recover").style.display=n.missed?"":"none";const O=n.paused?"PAUSA":n.doorsOpen?"PUERTAS / EMBARQUE":b?"EMERGENCIA":l?"FRENANDO":C?"TRACCIÓN":"DERIVA",V=k?n.speed*n.speed/(2*2.5):0;t("mode").textContent=`${O} · PARADA ${Math.round(V)} m`,E.querySelectorAll(".station").forEach((ie,oe)=>{ie.classList.toggle("current",oe===n.target),ie.classList.toggle("passed",oe<n.target)}),n.complete&&!W&&(W=!0,t("finalScore").textContent=n.score,t("complete").style.display="grid");const U=`${n.position}:${S}:${n.doorsOpen}:${a.renderRevision}`;U!==Y&&(h.render(a.scene,a.camera),Y=U),requestAnimationFrame(F)}["interior","operator"].includes(new URLSearchParams(location.search).get("view"))&&(d(3),A(new URLSearchParams(location.search).get("view")==="operator"?"operator":"saloon")),a.update(0,o.state.position,{doorsOpen:o.state.doorsOpen,doorSide:o.state.doorSide,speed:o.state.speed}),h.render(a.scene,a.camera),requestAnimationFrame(F),addEventListener("resize",()=>{a.resize(innerWidth,innerHeight),h.setSize(innerWidth,innerHeight),Y=""})}Be().catch(p=>console.error("Metro bootstrap failed",p));
