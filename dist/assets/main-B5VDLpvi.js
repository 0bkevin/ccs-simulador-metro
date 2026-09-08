import{s as de,G as pe,R as ue,C as me,V as he,O as ge,l as fe,W as be,T as ve}from"./style-_gup-WXt.js";import{R as we,c as ye,a as Ae,p as ne,b as re,g as Ce,d as oe,e as Te,s as xe,f as ke}from"./blender-presentation-x6OGwzf8.js";const Ee=`# Línea 1 del Metro de Caracas: investigación para el juego

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

Un bogie normalmente integra dos ejes y ruedas solidarias en cada eje; la adherencia rueda–riel limita el esfuerzo de tracción y de frenado. La suspensión primaria aísla irregularidades entre eje/bogie y bastidor, y la secundaria aísla el bastidor de la caja. Son principios de diseño ferroviario, no dimensiones verificadas del Serie 6. La caja de un metro añade estructura, cableado de alta y baja tensión, convertidores auxiliares, HVAC, puertas eléctricas, interfonía, información al pasajero y acoples entre coches. Alstom documenta estos subsistemas en trenes de metro comparables, pero el interior, número de puertas y pasillo entre coches de Caracas quedan sin confirmar ([Alstom Sydney Metro EPD](https://www.alstom.com/sites/alstom.com/files/2024/06/20/Alstom_EPD_SYDNEY_METRO_EN.pdf)).

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
`,Se=`# Línea 1 station references (five-station game route)

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
`,Le=`# Independent station and tunnel study · 7 September 2026

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
`,ze=`# Blender reference rebuild

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
manufacturer coupler-to-coupler length. Doors and wheels remain static in the
web export. The native source and exported assets use the same geometry. The
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
Neither the train nor its interior is certified 1:1; doors and wheels remain static.
`,se={color:"#d71920",realStationCount:22},Y=se.color,Re=[{id:"cano-amarillo",name:"Caño Amarillo",distance:0,color:Y,type:"elevated",platformLayout:"side",railCenters:[0,4],interchange:null,detail:"Estación elevada junto al antiguo eje ferroviario Caracas–La Guaira, con cubierta reticulada amarilla y andenes laterales."},{id:"capitolio",name:"Capitolio",distance:900,color:Y,type:"subterránea",platformLayout:"side",railCenters:[0,4],interchange:"Conexión peatonal con El Silencio (Línea 2)",detail:"Estación profunda del centro con mezzanina y conexión peatonal hacia El Silencio."},{id:"bellas-artes",name:"Bellas Artes",distance:1800,color:Y,type:"subterránea",platformLayout:"island",railCenters:[0,10],interchange:null,detail:"Estación profunda con andén central bajo el eje cultural de Bellas Artes."},{id:"plaza-venezuela",name:"Plaza Venezuela",distance:2800,color:Y,type:"subterránea",platformLayout:"side",railCenters:[0,4],interchange:"Líneas 3 y 4 (conexiones del complejo)",detail:"Complejo de transferencia con niveles y pasillos de conexión de alta demanda."},{id:"altamira",name:"Altamira",distance:3900,color:Y,type:"subterránea",platformLayout:"island",railCenters:[0,10],interchange:null,detail:"Estación de tres niveles bajo la plaza y avenida Francisco de Miranda, con andén central y mezzanina."}],ie=Re.map((v,y)=>({...v,...de.stations[y]}));function Me(v,y,e,h){var H,V;const o=((H=h.train.interior)==null?void 0:H.cars)||[],l=new pe;l.name="Blender passenger lighting",v.add(l),we.init();const k=(((V=h.lighting)==null?void 0:V.trainAreaLights)||[]).map(g=>{const I=new ue(new me().fromArray(g.color),g.power/(g.width*g.height),g.width,g.height);return I.name=g.name,I.position.fromArray(g.position),I.quaternion.fromArray(g.quaternion),I.userData.carIndex=Number(g.collection.slice(-2)),I.visible=!1,l.add(I),I});let A=1,C="saloon",t=!1,L=0,f=null,d=0,x=0,E=6.63;const p=new he(.22,2.57,0);function z(g=A,I="saloon"){A=Math.max(1,Math.min(o.length||7,Number(g)||1)),C=["saloon","seats","doors","gangway"].includes(I)?I:"saloon";const s=o[A-1];d=0,x=0,E=6.63,p.set(.22,(s==null?void 0:s.eyeY)||2.57,0),C==="seats"&&(E=4.25,p.x=-.22,p.y=2.22,d=-1.3,x=-.36),C==="doors"&&(E=2.333,p.x=.28,d=-Math.PI/2,x=-.08),C==="gangway"&&(E=-8.6,p.x=.22),L++}function R(g,I,s=g){t=I&&o.length>0;const S=o[A-1];t&&S&&(y.position.set(p.x,p.y,g+S.center+S.direction*E),y.lookAt(y.position.x+S.direction*Math.sin(d)*Math.cos(x),y.position.y+Math.sin(x),y.position.z-S.direction*Math.cos(d)*Math.cos(x)));const n=t?A:o.reduce((i,w)=>{var c;return Math.abs(g+w.center-s)<Math.abs(g+(((c=o[i-1])==null?void 0:c.center)||0)-s)?w.index:i},1);for(const i of k)i.visible=v.visible&&Math.abs(i.userData.carIndex-n)<=(t?1:0)}function T(g){E=Math.max(-9.6,Math.min(7.6,Number(g)||0)),L++}const m=e==null?void 0:e.domElement,D=g=>{!t||g.button!==0||(f={id:g.pointerId,x:g.clientX,y:g.clientY},m.setPointerCapture(g.pointerId))},N=g=>{!t||!f||f.id!==g.pointerId||(d-=(g.clientX-f.x)*.004,x=Math.max(-1.1,Math.min(1.1,x-(g.clientY-f.y)*.004)),f.x=g.clientX,f.y=g.clientY,L++)},M=()=>{f=null};return m==null||m.addEventListener("pointerdown",D),m==null||m.addEventListener("pointermove",N),m==null||m.addEventListener("pointerup",M),m==null||m.addEventListener("pointercancel",M),{select:z,update:R,move:T,cars:o,lights:k,get revision(){return L},get state(){return{carIndex:A,view:C,travel:E,enabled:t}},dispose(){m==null||m.removeEventListener("pointerdown",D),m==null||m.removeEventListener("pointermove",N),m==null||m.removeEventListener("pointerup",M),m==null||m.removeEventListener("pointercancel",M)}}}function Ie(v,y,e=[],h){if(!(h!=null&&h.train)||!(h!=null&&h.environment))throw new Error("Los modelos Blender aún no están disponibles.");const o=new v.Scene,l=ye(o,y,h.manifest),k=Ae(o);o.fog=new v.Fog(1581354,260,900);const A=new v.Group;A.name="Caracas Metro L1 · Blender export",o.add(A);const C=h.environment;C.name="Blender environment · five stops",A.add(C),ne(C,y);const t=[];C.traverse(s=>{!s.isMesh&&s.userData.sourceCollection&&t.push(s)});const L=e.map(s=>t.find(S=>S.userData.sourceCollection===s.collection));if(L.some(s=>!s))throw new Error("Falta una estación Blender en el entorno del juego.");const f=h.train;f.name="Blender train · 7 cars",A.add(f),ne(f,y);const d={forward:new v.PerspectiveCamera(70,1,.05,1200),exterior:new v.PerspectiveCamera(68,1,.1,900),platform:new v.PerspectiveCamera(68,1,.1,900),inspection:new v.PerspectiveCamera(68,1,.2,700),interior:new v.PerspectiveCamera(72,1,.035,700)},x=Me(f,d.interior,y,h.manifest);let E="platform",p=null,z=0,R=0;const T=y?new ge(d.inspection,y.domElement):null;T&&(T.enabled=!1,T.enableDamping=!1,T.minDistance=.5,T.maxDistance=260,T.addEventListener("change",()=>{z++}));const m=()=>p?d.inspection:d[E];function D(s){return E=["forward","exterior","platform","interior"].includes(s)?s:"platform",z++,m()}function N(s=R,S="platform"){s=Math.max(0,Math.min(e.length-1,Number(s)||0));const n=Ce(s,S,d.inspection.aspect);p={index:s,...n};for(const w of t)w.visible=n.collections.includes(w.userData.sourceCollection);re(y,n),k.show(s,n.kind);const i=e[s].distance;return f.visible=["platform","detail","concourse"].includes(n.kind)&&f.position.z>=i-148&&f.position.z<=i+150,d.inspection.up.fromArray(n.up),d.inspection.position.fromArray(n.position),d.inspection.fov=n.fov,d.inspection.updateProjectionMatrix(),d.inspection.lookAt(...n.target),T&&(T.enabled=!0,T.target.fromArray(n.target),T.update()),l.focus(d.inspection.position,n.collection,n.exterior,["plan","section"].includes(n.kind)),z++,p}function M(){p=null,re(y,{}),k.hide(),T&&(T.enabled=!1),t.forEach(s=>{s.visible=!0}),f.visible=!0,z++}function H(s){if((p==null?void 0:p.kind)!=="tunnel"||!Number.isFinite(Number(s)))return;const{start:S,end:n}=oe(p.index),i=Math.max(S+2,Math.min(n-2,Number(s)));d.inspection.position.set(0,2.5,i),d.inspection.lookAt(0,2.15,i+18),T&&(T.target.set(0,2.15,i+18),T.update()),l.focus(d.inspection.position,p.collection),z++}function V(s=.016,S=0){f.position.set(0,0,Number(S)||0);const n=f.position.z;d.forward.position.set(0,2.5,n+5),d.forward.lookAt(0,2,n+15);const i=x.cars[x.state.carIndex-1],w=E==="interior"&&i?n+i.center+i.direction*x.state.travel:E==="platform"?n-84:n+4.6;R=e.findIndex(j=>w<=j.distance+5),R<0&&(R=e.length-1);const c=e[R],b=w>=c.distance-145&&w<=c.distance+5,P=["Bellas Artes","Altamira"].includes(c==null?void 0:c.name),F=P?5:(c==null?void 0:c.name)==="Capitolio"?-6:-3.9;d.platform.position.set(b?F:0,2.73,b?n-84:n+5),d.platform.lookAt(b?F:0,2.98,b?n-69:n+23);const O=e.some(j=>n+4.6>=j.distance-145&&n+4.6<=j.distance+5);if(d.exterior.position.set(O?P?5.8:-5.8:0,2.73,n+4.6),d.exterior.lookAt(0,2.1,O?n-4:n+22),x.update(n,E==="interior"&&!p,m().position.z),p)l.focus(d.inspection.position,p.collection,p.exterior,["plan","section"].includes(p.kind));else{const j=m().position.clone(),q=e.find(K=>j.z>=K.distance-145&&j.z<=K.distance+5),U=Math.max(0,e.findLastIndex(K=>j.z>K.distance+5));l.focus(j,(q==null?void 0:q.collection)||`Tunnel ${e[U].id}`)}}function g(s,S){Object.values(d).forEach(n=>{n.aspect=s/Math.max(1,S),n.updateProjectionMatrix()})}function I(){A.traverse(s=>{var S;s.geometry&&s.geometry.dispose(),(S=s.material)!=null&&S.dispose&&s.material.dispose()}),T==null||T.dispose(),l.dispose(),x.dispose(),k.dispose()}return{scene:o,root:A,train:f,cameras:d,get camera(){return m()},get inspection(){return p},get activeStation(){return R},get renderRevision(){return z+x.revision},get doorFraction(){return 0},setCameraMode:D,inspectStation:N,leaveInspection:M,moveTunnel:H,update:V,resize:g,dispose:I,controls:T,stationAssemblies:L,railPaths:[],lighting:l,interior:x,assetSource:h.source,manifest:h.manifest}}function je(v=[]){var l;const y=((l=v[0])==null?void 0:l.distance)??0;let e;const h=()=>({position:y,speed:0,target:0,doorsOpen:!0,dwell:3,started:!1,missed:!1,complete:!1,paused:!1,score:100,serviceCount:0});return e=h(),{get state(){return{...e}},start(){return e.started=!0,this},reset(){return e=h(),e.started=!0,this},pause(k=!e.paused){return e.paused=k,this},toggleDoors(){const k=v[e.target],A=k&&Math.abs(e.position-k.distance)<=12;return e.speed>.04||!A||e.missed||e.complete?this.state:(e.doorsOpen?e.dwell<=0&&(e.doorsOpen=!1,e.serviceCount++,e.target===v.length-1?e.complete=!0:e.target++):(e.doorsOpen=!0,e.dwell=3),this.state)},recover(){const k=v[e.target];return!k||e.complete||!e.missed?this.state:(e.position=k.distance,e.speed=0,e.doorsOpen=!0,e.dwell=3,e.missed=!1,e.score=Math.max(0,e.score-15),this.state)},tick(k,A={}){if(!e.started||e.paused||e.complete)return this.state;const C=Math.min(Math.max(Number(k)||0,0),.05);e.doorsOpen&&(e.dwell=Math.max(0,e.dwell-C));const t=!!A.throttle&&!e.doorsOpen&&!e.missed;A.emergency?e.speed=Math.max(0,e.speed-3*C):A.brake?e.speed=Math.max(0,e.speed-2.5*C):t?e.speed=Math.min(18,e.speed+1.15*C):e.speed=Math.max(0,e.speed-.22*C),e.position+=e.speed*C;const L=v[e.target];return L&&e.position>L.distance+12&&!e.missed&&(e.missed=!0,e.score=Math.max(0,e.score-20)),this.state}}}const Ne=[{title:"Metro De Caracas Compilación Trenes Alstom y CAF",url:"https://www.youtube.com/watch?v=Ej0X90zrtNg",creator:"Dani215 Railway",date:"2024-07-17",license:"No redistributable licence verified on the source page; reference-only",authenticity:"creator's description identifies Line 1 CAF Renfe Serie 6 footage (61047–61080), alongside Alstom footage; no audio copied"},{title:"OpenBVE Venezuela CAF Serie 6 asset pack (external download)",url:"https://www.mediafire.com/file/om2u9qlgt7gaahw/Pack_Series_10000_y_60000_MCCS_FINAL.zip/file",creator:"OpenBVE Venezuela / uploader credited on the pack page",license:"No reuse licence or permission statement found in the page/archive; do not bundle",authenticity:"CAF S6 train asset includes WAV filenames, but the archive does not establish that they are field recordings"},{title:"Caracas Metro compilation (Line 1, 2006–2013)",url:"https://www.youtube.com/watch?v=86YCTUO5gQw",creator:"MonteBRujaFM",license:"No redistributable licence verified on the source page; reference-only",authenticity:"creator describes Caracas Line 1 rolling-stock footage; audio remains copyrighted"},{title:"Caracas Metro 10000 and 20000 series sound examples",url:"https://www.youtube.com/watch?v=gtgx51bclew",creator:"YouTube uploader (linked by r/transit discussion)",license:"No redistributable licence verified on the source page; reference-only",authenticity:"identified as older Caracas Alstom 10000/20000-series stock, not CAF 60000-series; not bundled"},{title:"Caracas Metro 10000 and 20000 series sound example 2",url:"https://www.youtube.com/watch?v=cbB9gqDMQ0o",creator:"YouTube uploader (linked by r/transit discussion)",license:"No redistributable licence verified on the source page; reference-only",authenticity:"identified as older Caracas Alstom 10000/20000-series stock, not CAF 60000-series; not bundled"}],Pe={authenticity:"procedural gameplay fallback; no bundled Caracas recording"},Q=(v,y=0,e=1)=>Math.max(y,Math.min(e,v));function Oe(v,y=2){const e=v.createBuffer(1,v.sampleRate*y,v.sampleRate),h=e.getChannelData(0);let o=0;for(let l=0;l<h.length;l+=1)o=o*.965+(Math.random()*2-1)*.18,h[l]=o;return e}function _e({now:v=()=>performance.now()/1e3,contextFactory:y=null}={}){let e=null,h=!1,o=.65,l=!1,k=null,A=v(),C=0,t=0,L=[],f=null,d=null,x=[],E=[],p=null,z=null,R=null,T=null,m=null;function D(n,i,w,c=0){const b=e.createOscillator(),P=e.createGain();return b.type=n,b.frequency.value=i,P.gain.value=c,b.connect(P).connect(w),b.start(),L.push(b,P),{osc:b,gain:P}}function N(){if(e||l)return;const n=y||globalThis.AudioContext||globalThis.webkitAudioContext;if(!n)return;e=y?y():new n,f=e.createGain(),f.gain.value=0,d=e.createDynamicsCompressor(),d.threshold.value=-18,d.knee.value=16,d.ratio.value=7,d.attack.value=.008,d.release.value=.18,f.connect(d).connect(e.destination),x=[56,112,168].map((j,q)=>{const U=D(q===1?"triangle":"sine",j,f,0);return E.push(U.gain),U.osc});const i=e.createBufferSource();i.buffer=Oe(e),i.loop=!0;const w=e.createBiquadFilter();w.type="lowpass",w.frequency.value=760,w.Q.value=.45,p=e.createGain(),p.gain.value=0,i.connect(w).connect(p).connect(f),i.start(),L.push(i,w,p),z=e.createGain(),z.gain.value=0;const c=D("sawtooth",145,z,.07),b=e.createBiquadFilter();b.type="bandpass",b.frequency.value=820,b.Q.value=2.1,z.disconnect(),z.connect(b).connect(f),L.push(b,c),R=e.createGain(),R.gain.value=.002,R.connect(f);const P=D("sine",47,R,.6);L.push(P),T=e.createGain(),T.gain.value=0;const F=e.createOscillator(),O=e.createBiquadFilter();F.type="sawtooth",F.frequency.value=1700,O.type="bandpass",O.frequency.value=1350,O.Q.value=2,F.connect(O).connect(T).connect(f),F.start(),L.push(F,O,T),m=e.createGain(),m.gain.value=1,m.connect(f),L.push(m)}const M=(n,i,w=.06)=>{if(!e||!n)return;const c=e.currentTime;n.cancelScheduledValues(c),n.setTargetAtTime(i,c,w)};function H(){if(!e||!h||!T)return;const n=e.currentTime;[660,880].forEach((i,w)=>{const c=e.createOscillator(),b=e.createGain();c.type="sine",c.frequency.value=i,b.gain.setValueAtTime(1e-4,n+w*.16),b.gain.exponentialRampToValueAtTime(.06,n+w*.16+.012),b.gain.exponentialRampToValueAtTime(1e-4,n+w*.16+.22),c.connect(b).connect(m),c.start(n+w*.16),c.stop(n+w*.16+.25)})}function V(n,i={}){const w=Q(Number(n)||0,0,.1);A=v();const c=!!i.doorsOpen;if(k!==c&&k!==null&&(k===!0&&c===!1&&H(),t=1),k=c,!e||!h||l)return;const b=Q((Number(i.speed)||0)/18),P=!!(i.brake||i.emergency);t=Math.max(0,t-w/.8);const O=i.camera==="exterior"||i.cameraMode==="exterior"?.68:1,j=!!i.started&&!i.paused&&!i.complete&&!c,q=!!i.started&&!i.paused&&!i.complete,U=j?O:0;M(f.gain,o*(q?O*(c?.055:.1375+b*.275):0),.08),x.forEach((_,B)=>M(_.frequency,[56,113,171][B]+b*[130,260,390][B],.1));const K=i.throttle?1:.35;if(E.forEach((_,B)=>M(_.gain,U*(.018-B*.003)*(.15+b)*K,.1)),M(p.gain,U*(.018+b*.035),.14),M(z.gain,U*(P?.8:0)*b,.09),M(R.gain,q?O*.012:0,.2),M(T.gain,t*.012,.08),C+=w*(1.5+b*13),j&&b>.03&&C>=1){C%=1;const _=e.createOscillator(),B=e.createGain(),$=e.currentTime;_.type="triangle",_.frequency.value=540+Math.random()*90,B.gain.setValueAtTime(1e-4,$),B.gain.exponentialRampToValueAtTime(Math.max(2e-4,.018*b),$+.004),B.gain.exponentialRampToValueAtTime(1e-4,$+.045),_.connect(B).connect(f),_.start($),_.stop($+.05)}}async function g(n){return l?!1:(h=!!n,h&&(N(),e&&e.state==="suspended"&&e.resume&&typeof e.startRendering!="function"&&await e.resume()),e&&M(f.gain,h?o*.001:0,.04),h)}function I(){k=null,C=0,t=0,e&&M(f.gain,0,.04)}function s(n){return o=Q(Number(n)/100,0,1),e&&h&&M(f.gain,o*.001,.04),o*100}function S(){var n;l=!0,h=!1,L.forEach(i=>{var w,c;try{(w=i.stop)==null||w.call(i),(c=i.disconnect)==null||c.call(i)}catch{}}),(n=e==null?void 0:e.close)==null||n.call(e),L=[],e=null}return{setEnabled:g,setVolume:s,update:V,reset:I,dispose:S,status:()=>({enabled:h,available:!!e,running:!!(e&&e.state==="running"),lastUpdate:A})}}async function Be(){var X;const v=document.querySelector("#app");v.innerHTML='<div class="asset-loading" role="status"><div class="asset-loading-mark">M</div><div class="asset-loading-title">Cargando exportación Blender</div><div class="asset-loading-detail" id="assetLoadingDetail">Validando manifest.json…</div></div>';let y;try{y=await fe({onProgress:(a,u)=>{const r=document.querySelector("#assetLoadingDetail");r&&(r.textContent=`${a} · ${Math.round(u*100)}%`)}})}catch(a){const u=String((a==null?void 0:a.message)||a);throw v.innerHTML=`<div class="asset-error" role="alert"><div class="asset-loading-mark">!</div><h1>No se pudo abrir el mundo Blender</h1><p>${u.replace(/[&<>]/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[r])}</p><p>Comprueba que <code>public/models/blender/manifest.json</code>, <code>train.glb</code> y <code>environment.glb</code> estén publicados y vuelve a cargar.</p><button onclick="location.reload()">REINTENTAR</button></div>`,a}const e=(Array.isArray(ie)?ie:[]).map((a,u)=>{var r;return{...a,...y.manifest.stations[u]||{},distance:Number(((r=y.manifest.stations[u])==null?void 0:r.distance)??a.distance)}});v.replaceChildren();const h=new be({antialias:!0,powerPreference:"low-power"});Te(h),h.setSize(innerWidth,innerHeight),v.append(h.domElement);const o=Ie(ve,h,e,y);o.resize(innerWidth,innerHeight);const l=je(e),k=_e();window.__metro={world:o,sim:l,renderer:h,assetSource:y.source,manifest:y.manifest,assetsReady:!0};const A=document.createElement("div");A.className="ui",A.innerHTML=`
<div class="topbar"><div class="brand"><i>M</i><span>Metro de Caracas</span></div><div class="route-title">Línea 1 · dirección Altamira</div><div class="clock" id="clock">06:42:18</div></div>
<div class="route-panel"><div class="route-label">Recorrido · ${e.length} estaciones</div><div class="station-list" id="stationList"></div></div>
<div class="next"><div class="route-label">Objetivo</div><strong id="next">Caño Amarillo</strong><span id="distance">PUERTAS ABIERTAS</span></div>
<div class="mode" id="mode">PUERTAS / EMBARQUE</div>
<div class="progress"><b id="progress"></b></div>
<div class="bottom"><div class="hint"><kbd>W</kbd>/<kbd>↑</kbd> tracción &nbsp; <kbd>S</kbd>/<kbd>↓</kbd> freno &nbsp; <kbd>E</kbd> puertas &nbsp; <kbd>Espacio</kbd> emergencia</div><div class="meters"><div class="lever"><button data-a="brake">FRENO</button><button data-a="throttle">TRACCIÓN</button><button data-a="emergency">EMERGENCIA</button></div><div class="speed"><strong id="speed">00</strong><small> km/h</small><div class="bar"><b id="speedbar"></b></div></div></div></div>
<div class="controls"><button id="doors">PUERTAS</button><button id="pause">PAUSA</button><button id="camera">VISTA: EXTERIOR</button><button id="inspect" class="inspect">INSPECCIONAR TREN</button><button id="inspectStations" class="inspect">INSPECCIONAR ESTACIONES</button><button id="recover">RECUPERAR</button><button id="reset">REINICIAR</button><button id="sound">SONIDO</button><label title="Volumen del audio">VOL <input id="volume" type="range" min="0" max="100" value="65" aria-label="Volumen"></label><button id="share">COMPARTIR</button><button id="sources">FUENTES</button></div>
<div class="toast" id="toast"></div>
<div class="overlay" id="intro"><div class="card"><div class="corner">SIMULADOR 01 / CABINA</div><div class="eyebrow">Servicio de pasajeros · turno mañana</div><h1>Línea 1<br>en marcha.</h1><p>Conduce el tren desde Caño Amarillo hasta Altamira. Detente dentro de la zona de parada, abre puertas durante tres segundos y continúa.</p><button class="start" id="start">Abrir cabina</button><button class="secondary" id="inspectIntro">INSPECCIONAR TREN</button><button class="secondary" id="inspectStationsIntro">INSPECCIONAR ESTACIONES</button><p class="fine">Cinco estaciones, andenes de 150 m y túneles para conducir. Recorrido abreviado de 2,16 km. La línea histórica completa tiene ${se.realStationCount} estaciones.</p></div></div>
<div class="overlay" id="complete" style="display:none"><div class="card"><div class="eyebrow">Servicio finalizado</div><h1>Altamira</h1><p>Has servido las ${e.length} estaciones de este recorrido.</p><p class="scoreline">Puntuación <strong id="finalScore">100</strong></p><button class="start" id="restart">REINICIAR SERVICIO</button><button class="secondary" id="completeSources">VER FUENTES</button></div></div>
<div class="overlay" id="sourceModal" style="display:none"><div class="card source-card"><button class="corner" id="closeSources">CERRAR ×</button><div class="eyebrow">Documentación</div><h1>Fuentes</h1><p>Investigación sobre diseño, estaciones, trenes y mecánica de la Línea 1. Fuentes primarias consultadas:</p><div class="source-links"><a href="https://openjicareport.jica.go.jp/pdf/11789237_03.pdf" target="_blank" rel="noreferrer">JICA · datos de línea</a><a href="https://www.aschinfraestructuras.com/linea-caracas" target="_blank" rel="noreferrer">ASCH · rehabilitación de vía</a><a href="https://admin.cafmobility.com/uploads/281_CAF_Catalogo_General_ES_601604d06c.pdf" target="_blank" rel="noreferrer">CAF · catálogo</a><a href="https://www.alstom.com/fr/press-releases-news/2005/9/ALSTOM-remporte-un-contrat-cle-en-main-pour-le-Metro-de-Caracas-au-Venezuela-20050916" target="_blank" rel="noreferrer">Alstom · Metro de Caracas</a><a href="https://www.urbanrail.net/am/cara/pix/caracas-gallery1.htm" target="_blank" rel="noreferrer">UrbanRail · Altamira y Bellas Artes</a><a href="https://www.urbanrail.net/am/cara/pix/caracas-gallery2.htm" target="_blank" rel="noreferrer">UrbanRail · Capitolio</a><a href="https://www.urbanrail.net/am/cara/pix/caracas-gallery4.htm" target="_blank" rel="noreferrer">UrbanRail · Plaza Venezuela</a><a href="https://fundaayc.com/2024/07/14/algo-mas-sobre-la-postal-no-411/" target="_blank" rel="noreferrer">Fundación Arquitectura y Ciudad · Altamira</a><a href="https://recyt.fecyt.es/index.php/CyTET/article/download/83795/61863/276024" target="_blank" rel="noreferrer">Bemergui · arquitectura de estaciones</a></div><p><small>La grabación real es una referencia externa. El audio del juego es procedural; no se redistribuye la grabación.</small></p><button class="secondary" id="realListen">ESCUCHAR REFERENCIA REAL CAF/ALSTOM</button><iframe id="realFrame" title="Referencia real del Metro de Caracas" style="display:none;width:100%;aspect-ratio:16/9;border:0;margin-top:1rem" allow="autoplay; encrypted-media" allowfullscreen></iframe><div id="audioSources"></div><pre id="researchText"></pre><pre id="stationResearchText"></pre></div></div>`,v.append(A);const C=document.createElement("section");C.className="station-review-ui in-game-stations",C.hidden=!0,C.setAttribute("aria-label","Explorar estaciones"),C.innerHTML='<button id="returnToGame" class="back-link">← VOLVER A CONDUCIR</button><div class="review-kicker">EXPLORAR ESTACIÓN · JUEGO EN PAUSA</div><h1 id="gameStationTitle"></h1><p id="gameStationDetail"></p><label>ESTACIÓN <select id="gameStationSelect" aria-label="Estación para explorar"></select></label><div class="review-actions"><button data-station-view="platform">ANDÉN</button><button data-station-view="detail">DETALLE</button><button data-station-view="concourse">MEZZANINA</button><button data-station-view="entrance">ACCESO</button><button data-station-view="south">PLAZA SUR</button><button data-station-view="plan">PLANTA</button><button data-station-view="section">CORTE</button><button data-station-view="tunnel">TÚNEL</button></div><p id="gameStationMetrics" class="station-metrics"></p><label id="gameTunnelTravelLabel" hidden>RECORRER TÚNEL <input id="gameTunnelTravel" type="range" step="1" aria-label="Recorrer túnel en metros"></label><p class="review-hint">Planta y corte: geometría del modelo en metros; medidas de estación estimadas.</p><p class="review-hint">Arrastra para mirar · rueda para acercarte.<br>Tu recorrido se conserva. Esc para volver.</p>',A.append(C);const t=a=>A.querySelector("#"+a),L=t("stationList");e.forEach((a,u)=>{const r=document.createElement("div");r.className="station",r.textContent=a.name,r.dataset.i=u,L.append(r)}),t("researchText").textContent=Ee,t("stationResearchText").textContent=Le+`

`+Se;const f=document.createElement("pre");f.textContent=ze,t("stationResearchText").before(f);const d=document.createElement("a");d.href="https://commons.wikimedia.org/wiki/File:Metro_de_caracas_linea_1.jpg",d.target="_blank",d.rel="noopener noreferrer",d.textContent="CAF Serie 6 · fotografía original usada para el modelo",A.querySelector(".source-links").prepend(d),t("audioSources").textContent=Pe.authenticity,Ne.forEach(a=>{const u=document.createElement("a");u.href=a.url,u.target="_blank",u.rel="noopener noreferrer",u.textContent=`${a.title} — ${a.creator}`,u.style.display="block",t("audioSources").append(u)}),t("realListen").onclick=()=>{t("realFrame").src="https://www.youtube-nocookie.com/embed/Ej0X90zrtNg",t("realFrame").style.display="block"};let x=!1,E=!1,p=!1,z=0;const R=["platform","exterior","forward","interior"],T={platform:"ANDÉN",exterior:"EXTERIOR",forward:"MARCHA",interior:"INTERIOR"};t("camera").textContent="VISTA: ANDÉN";let m=!1,D=!1,N=!1,M=!1,H=!1;const V=t("gameStationSelect");e.forEach((a,u)=>{const r=document.createElement("option");r.value=u,r.textContent=a.name,V.append(r)});function g(a=o.activeStation,u="platform"){o.inspection||(H=l.state.paused,b(!1),p=!1,l.pause(!0));const r=o.inspectStation(a,u),J=xe[r.index];V.value=r.index,t("gameStationTitle").textContent=J.name,t("gameStationDetail").textContent=J.detail,t("gameStationMetrics").textContent=ke(r.index,r.kind),t("gameTunnelTravelLabel").hidden=r.kind!=="tunnel";const G=oe(r.index);t("gameTunnelTravel").min=G.start+2,t("gameTunnelTravel").max=G.end-2,t("gameTunnelTravel").value=o.camera.position.z,C.querySelectorAll("[data-station-view]").forEach(W=>{W.hidden=!r.views.includes(W.dataset.stationView),W.classList.toggle("active",W.dataset.stationView===r.kind),W.setAttribute("aria-pressed",W.dataset.stationView===r.kind)}),C.hidden=!1,s.hidden=!0,A.classList.add("station-inspecting")}function I(){o.leaveInspection(),C.hidden=!0,A.classList.remove("station-inspecting"),s.hidden=R[z]!=="interior",l.pause(H)}V.onchange=()=>g(Number(V.value)),C.querySelectorAll("[data-station-view]").forEach(a=>{a.onclick=()=>g(o.inspection.index,a.dataset.stationView)}),t("returnToGame").onclick=I,t("gameTunnelTravel").oninput=a=>o.moveTunnel(a.target.value);const s=document.createElement("section");s.className="interior-controls",s.hidden=!0,s.setAttribute("aria-label","Interior del tren"),s.innerHTML='<div class="route-label">Salón de pasajeros · CAF</div><label>COCHE <select id="interiorCar" aria-label="Coche del tren"></select></label><div class="interior-presets"><button data-interior-view="saloon">SALÓN</button><button data-interior-view="seats">ASIENTOS</button><button data-interior-view="doors">PUERTAS</button><button data-interior-view="gangway">INTERCONEXIÓN</button></div><label>RECORRER COCHE <input id="interiorTravel" type="range" min="-9.6" max="7.6" step=".01" value="6.63" aria-label="Posición dentro del coche"></label><p>Arrastra para mirar alrededor.<br>W / S siguen controlando el tren.</p>',A.append(s);for(let a=1;a<=7;a++){const u=document.createElement("option");u.value=a,u.textContent=`${a} · ${a===1||a===7?"Extremo":"Intermedio"}`,t("interiorCar").append(u)}function S(a="saloon"){o.interior.select(Number(t("interiorCar").value),a),t("interiorTravel").value=o.interior.state.travel,s.querySelectorAll("[data-interior-view]").forEach(u=>{u.classList.toggle("active",u.dataset.interiorView===a),u.setAttribute("aria-pressed",u.dataset.interiorView===a)})}t("interiorCar").onchange=()=>S(),t("interiorTravel").oninput=a=>o.interior.move(a.target.value),s.querySelectorAll("[data-interior-view]").forEach(a=>{a.onclick=()=>S(a.dataset.interiorView)});function n(a){z=a,o.setCameraMode(R[a]),t("camera").textContent=`VISTA: ${T[R[a]]}`,s.hidden=R[a]!=="interior"}const i=document.createElement("button");i.id="enterInterior",i.className="inspect",i.textContent="INTERIOR DEL TREN",i.onclick=()=>{n(3),S()},t("camera").after(i);const w=document.createElement("button");w.className="secondary",w.textContent="VER INTERIOR",w.onclick=()=>{l.start(),t("intro").style.display="none",n(3),S()},t("inspectIntro").after(w);function c(a){t("toast").textContent=a,t("toast").classList.add("show"),clearTimeout(c.timer),c.timer=setTimeout(()=>t("toast").classList.remove("show"),1700)}function b(a=!1){x=a,E=a}function P(){if(N||o.inspection)return;const a=l.state,u=l.toggleDoors();a.doorsOpen!==u.doorsOpen?c(u.doorsOpen?"Puertas abiertas":"Puertas cerradas"):a.dwell>0?c("Espera el embarque"):c("Fuera de zona de parada")}function F(){N||(b(!1),p=!1,D=l.state.paused,l.pause(!0),k.update(0,{...l.state,paused:!0,doorsOpen:!0}),N=!0,t("sourceModal").style.display="grid")}function O(){N&&(N=!1,t("sourceModal").style.display="none",t("realFrame").src="",t("realFrame").style.display="none",l.pause(D),k.reset())}function j(){o.inspection&&I(),b(!1),p=!1,n(0);const a=l.reset();return t("intro").style.display="none",t("complete").style.display="none",M=!1,c("Servicio reiniciado"),a}function q(a){if(o.inspection){a.code==="Escape"&&(a.preventDefault(),I());return}N||a.repeat||!l.state.started||a.target instanceof HTMLInputElement||a.target instanceof HTMLSelectElement||a.target instanceof HTMLTextAreaElement||!["KeyW","ArrowUp","KeyS","ArrowDown","Space","KeyE","KeyC","KeyP","KeyR"].includes(a.code)||(a.preventDefault(),(a.code==="KeyW"||a.code==="ArrowUp")&&(x=!0),(a.code==="KeyS"||a.code==="ArrowDown")&&(E=!0),a.code==="Space"&&(p=!0,c("Freno de emergencia")),a.code==="KeyE"&&P(),a.code==="KeyC"&&n((z+1)%R.length),a.code==="KeyP"&&(l.pause(),c(l.state.paused?"Pausa":"Continuar")),a.code==="KeyR"&&j())}function U(a){(a.code==="KeyW"||a.code==="ArrowUp")&&(x=!1),(a.code==="KeyS"||a.code==="ArrowDown")&&(E=!1)}addEventListener("keydown",q),addEventListener("keyup",U),addEventListener("blur",()=>{b(!1),p=!1,l.pause(!0)}),document.addEventListener("visibilitychange",()=>{document.hidden&&(b(!1),p=!1,l.pause(!0))}),t("start").onclick=()=>{l.start(),t("intro").style.display="none",c("Caño Amarillo · servicio listo")},t("doors").onclick=P,t("pause").onclick=()=>{l.pause(),c(l.state.paused?"Pausa":"Continuar")},t("recover").onclick=()=>{l.recover(),c("Tren recuperado · penalización aplicada")},t("reset").onclick=j,t("camera").onclick=()=>{n((z+1)%R.length)},t("inspect").onclick=()=>{window.location.href="/model-review.html"},t("inspectIntro").onclick=()=>{window.location.href="/model-review.html"},t("inspectStations").onclick=()=>{g()},t("inspectStationsIntro").onclick=()=>{g()},t("sound").onclick=()=>{m=!m,k.setEnabled(m),t("sound").textContent=m?"SONIDO ON":"SONIDO"},t("volume").oninput=a=>k.setVolume(a.target.value),t("sources").onclick=F,t("share").onclick=async()=>{const a={title:"Metro de Caracas · Línea 1",text:"Conduce el Metro de Caracas desde Caño Amarillo hasta Altamira.",url:window.location.href};try{navigator.share?await navigator.share(a):(await navigator.clipboard.writeText(window.location.href),c("Enlace copiado"))}catch(u){(u==null?void 0:u.name)!=="AbortError"&&c("Copia el enlace del navegador")}},t("completeSources").onclick=F,t("closeSources").onclick=O,t("restart").onclick=j,document.querySelectorAll("[data-a]").forEach(a=>{const u=()=>{N||o.inspection||(a.dataset.a==="throttle"&&(x=!0),a.dataset.a==="brake"&&(E=!0),a.dataset.a==="emergency"&&(p=!0,c("Freno de emergencia")))},r=()=>{a.dataset.a==="throttle"&&(x=!1),a.dataset.a==="brake"&&(E=!1)};a.onpointerdown=u,a.onpointerup=r,a.onpointercancel=r,a.onpointerleave=r});const K=((X=e.at(-1))==null?void 0:X.distance)||1;let _=performance.now(),B="";function $(a){var ee;if(document.hidden){_=a,requestAnimationFrame($);return}const u=Math.min((a-_)/1e3,.05);_=a;const r=l.tick(u,{throttle:x&&o.doorFraction<.001,brake:E,emergency:p});r.speed<=.01&&(p=!1),o.update(r.paused?0:u,r.position,{doorsOpen:r.doorsOpen,speed:r.speed,throttle:x,brake:E,emergency:p});const J=o.doorFraction<.001;k.update(u,{...r,throttle:x&&J,brake:E,emergency:p,cameraMode:R[z]});const G=e[r.target],W=Math.round(r.speed*3.6);t("speed").textContent=String(W).padStart(2,"0"),t("speedbar").style.width=Math.min(100,W/65*100)+"%",t("progress").style.width=Math.min(100,r.position/K*100)+"%",t("clock").textContent=new Date().toLocaleTimeString("es-VE",{hour12:!1}),t("next").textContent=r.complete?((ee=e.at(-1))==null?void 0:ee.name)||"—":(G==null?void 0:G.name)||"—",t("distance").textContent=r.missed?"PARADA OMITIDA · RECUPERAR":r.complete?"FIN DE LÍNEA":r.doorsOpen?`EMBARQUE · ${Math.ceil(r.dwell)} s`:`${Math.max(0,Math.round(((G==null?void 0:G.distance)||0)-r.position))} m · ${r.score} PTS`,t("doors").textContent=r.doorsOpen?"PUERTAS ABIERTAS":"PUERTAS CERRADAS",t("pause").textContent=r.paused?"CONTINUAR":"PAUSA",t("recover").style.display=r.missed?"":"none";const le=r.paused?"PAUSA":r.doorsOpen?"PUERTAS / EMBARQUE":p?"EMERGENCIA":E?"FRENANDO":x?"TRACCIÓN":"DERIVA",ce=G?r.speed*r.speed/(2*2.5):0;t("mode").textContent=`${le} · PARADA ${Math.round(ce)} m`,L.querySelectorAll(".station").forEach((ae,te)=>{ae.classList.toggle("current",te===r.target),ae.classList.toggle("passed",te<r.target)}),r.complete&&!M&&(M=!0,t("finalScore").textContent=r.score,t("complete").style.display="grid");const Z=`${r.position}:${z}:${r.doorsOpen}:${o.renderRevision}`;Z!==B&&(h.render(o.scene,o.camera),B=Z),requestAnimationFrame($)}new URLSearchParams(location.search).get("view")==="interior"&&(n(3),S()),o.update(0,l.state.position,{doorsOpen:l.state.doorsOpen,speed:l.state.speed}),h.render(o.scene,o.camera),requestAnimationFrame($),addEventListener("resize",()=>{o.resize(innerWidth,innerHeight),h.setSize(innerWidth,innerHeight),B=""})}Be().catch(v=>console.error("Metro bootstrap failed",v));
