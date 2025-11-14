import React from 'react';
import { Link } from 'react-router-dom';

function TemarioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg p-8 rounded-lg shadow-xl border border-white/10">
        <h1 className="text-3xl font-bold mb-6 text-center">Temario de Repaso</h1>
        <h2 className="text-xl text-center text-gray-300 mb-8">
          Examen Final - Historia de la Música del Paraguay
        </h2>

        <div className="prose prose-invert max-w-none text-gray-300">
          <h3 className="text-purple-400">I. Contexto Histórico e Integración Cultural</h3>
          <p>El libro comienza contextualizando a Paraguay, un país mediterráneo en el centro de América del Sur, históricamente conocido como la "Paraguay, Provincia Gigante de las Indias" debido a su gran extensión. La llegada de los españoles en el siglo XVI, comenzando con Alejo García en 1524, inició un proceso de colonización y la fundación de Asunción en 1537. Este periodo marcó la desintegración de las culturas aborígenes. La alianza inicial de los guaraníes con los españoles, vista como una defensa contra tribus paleolíticas, evolucionó hacia la imposición del sistema de la Encomienda, lo que provocó rebeliones.</p>

          <h3 className="text-purple-400">II. Los Indígenas y su Música</h3>
          <p>El Paraguay prehistórico estaba habitado por diversas culturas, incluyendo 5 grandes familias lingüísticas: ZAMUCO, MASKOY, MATAKO, GUAYCURÚ y TUPI-GUARANÍ, siendo esta última la que más influyó en la identidad paraguaya.</p>
          <p>La música indígena está ligada a actividades cotidianas y carece del prejuicio de lo estético. Cumple funciones rituales, como propiciar la fecundidad, la buena cosecha y ahuyentar los malos espíritus. No existen músicos especialistas, ya que todos participan de la experiencia, a menudo integrando texto, canto, danza y ejecución musical en ceremonias.</p>
          <p><strong>Análisis Morfológico de la Música Indígena:</strong> La música aborigen es anaestructural (le falta "algo" para el oído occidental), con frases que se repiten sin variación aparente, a menudo hasta por cansancio. El ritmo predominante es binario. Las melodías son limitadas, desarrollándose en un marco de 3 a 4 notas o utilizando la escala pentafónica. El canto es monódico (a una sola voz) y se acompaña con instrumentos rítmicos.</p>
          <p><strong>Instrumentos Musicales Indígenas:</strong> Se clasifican en Aerófonos (instrumentos de viento), Idiófonos (instrumentos que vibran por sí mismos), Cordófonos (instrumentos de cuerda) y Membranófonos (instrumentos de membrana).</p>
          <ul>
            <li><strong>Idiófonos:</strong> Se destacan las Maracas o Mbaraka (de calabaza con semillas, usadas por chamanes como instrumento ritual llamado aguaipu), el Bastón de Ritmo o Takuapu (larga caña de tacuara que golpea el suelo, de uso exclusivo femenino), y los sonajeros de uñas o pezuñas (usados en ceremonias de pubertad para alejar espíritus malignos).</li>
            <li><strong>Aerófonos:</strong> Incluyen la flauta genérica Mimby (vertical u horizontal, hecha de caña o madera), con variedades como el Mimby guasu y el Mimby tarara (tipo trompeta guerrera). También se mencionan trompetas como el Congoera (de huesos) y el Turu (de bambú o cuerno), y silbatos como el Serere.</li>
            <li><strong>Cordófonos:</strong> Son monocordes, como el Arco de boca (utiliza la cavidad bucal como resonador) y el Gualambáu o Marimbáu (arco con resonador de calabaza).</li>
            <li><strong>Membranófonos:</strong> Principalmente el Tambor o Kurugu (troncos ahuecados o barro, cubiertos de pieles de animales).</li>
          </ul>

          <h3 className="text-purple-400">III. La Música Durante la Colonia y las Misiones Jesuíticas</h3>
          <p>La primera orquesta conocida en Paraguay se formó en Asunción en 1545 por Gregorio de Acosta. El periodo colonial más trascendente para la música fue el de las Misiones Jesuíticas (siglos XVI y XVII). A partir de 1609, los jesuitas establecieron más de 30 pueblos con estricta organización, desarrollando imprentas y fábricas de instrumentos musicales.</p>
          <p><strong>Músicos Jesuitas Destacados:</strong> Muchos jesuitas eran músicos talentosos. Entre ellos figuran Pedro Comentale (Nápoles, 1595-1664), quien presentó un grupo de músicos indígenas en Buenos Aires; Jean Vaisseau (Bélgica, 1584-1623), maestro de capilla de Carlos V; Luis Berger (Francia, 1588-1639), quien enseñó a los indígenas a ejecutar instrumentos; Anton Sepp (Austria, 1655-1733), quien ejecutaba más de 20 instrumentos y convirtió a Yapeyú en un centro musical.</p>
          <p>La figura más influyente fue Domenico Zipoli (Italia, 1688-1726), organista de Roma y compositor destacado de su tiempo. Llegó a América en 1717 y se estableció en Córdoba (Argentina). Su música se hizo muy apreciada en las reducciones, componiendo numerosas obras religiosas que fueron solicitadas constantemente. La mayoría de sus composiciones se perdieron tras la expulsión de los jesuitas en 1767. No obstante, el descubrimiento de más de 10.000 manuscritos musicales en 1972 en la Reducción de Chiquitos (Bolivia) por Hans Roth, incluyó numerosas páginas de Zipoli y otros compositores. Los instrumentos más difundidos en las reducciones fueron el violín, el clave y el órgano, así como el arpa y la guitarra.</p>

          <h3 className="text-purple-400">IV. La Música en la Independencia y la Época de Los López</h3>
          <p>Durante la dictadura del Dr. José Gaspar Rodríguez de Francia (1811-1840), aunque las manifestaciones artísticas se restringieron al ámbito privado, el Estado adquirió y difundió instrumentos y partituras. Se creó la Escuela de Jóvenes Aprendices de Música Militar en 1817. Cronistas de la época, como Rengger (1820), describían la música como monótona, acompañada de guitarra, y los hermanos Robertson hablaban del purahéi asy (canto lloroso).</p>
          <p><strong>El Himno Nacional:</strong> El auténtico himno patriótico del Paraguay fue inicialmente el Canto Patriótico o Tetã Purahéi, escrito en guaraní por Anastasio Rolón hacia 1830. El actual Himno Nacional se basa en el texto solicitado por Carlos Antonio López al poeta uruguayo Francisco Acuña de Figueroa en 1840. La autoría de la música sigue siendo controvertida, figurando Francisco José Debali, Francisco Sauvageot de Dupuis y José Giuffra como presuntos autores. La versión oficial de la música fue la reconstruida por Remberto Giménez y oficializada en 1934.</p>
          <p><strong>Músicos Destacados de la Primera Mitad del Siglo XIX:</strong> Figuras importantes incluyen a los instructores militares Benjamín y Felipe González, José Gabriel Téllez (director de la primera escuela pública), Antonio María Quintana (virtuoso de la guitarra, atribuido a la música del Himno Primitivo), y los guitarristas populares Kangüe Herreros, Rufino López, Ulpiano López y Tomás Miranda.</p>
          <p><strong>Época de Los López (1840-1870):</strong> Este periodo se caracterizó por el progreso material y cultural. En 1853 se contrató al maestro francés Francisco Sauvageot de Dupuis para formar bandas militares y como profesor. En esta época, en 1858, aparece la primera referencia a la Polca como forma de música popular más difundida en Paraguay. Músicos formados por Dupuis incluyen a Cantalicio Guerrero (clarinetista, director de la primera Orquesta Nacional subvencionada) y Indalecio Odriozola (director de orquesta).</p>

          <h3 className="text-purple-400">V. La Guerra de la Triple Alianza y las Danzas</h3>
          <p>Durante la Guerra de la Triple Alianza (1865-1870), la música fue fundamental para mantener la moral. La francesa Alicia Elisa Lynch (Madama Lynch) introdujo bailes de salón europeos como el Lancero, Cuadrilla, Vals y Mazurca. Gran parte de estas danzas fueron adaptadas y se convirtieron en danzas tradicionales paraguayas.</p>
          <p><strong>Danzas Paraguayas:</strong> Son producto de la mezcla de la cultura europea y la autóctona guaraní. Ejemplos incluyen la Contradanza, el Pericón, el Cielito Chopí, la Polca y la Mazurca.</p>
          <ul>
            <li><strong>Tipos de Danzas:</strong> Se agrupan en Danza de las Galoperas (sin coreografía fija), Danza de las Botellas (única danza individual que requiere gran equilibrio), y Danzas en parejas (con coreografías fijas como Chopí, Londón Carape, Solito).</li>
            <li><strong>Trajes Típicos:</strong> El masculino incluye sombrero pirí, pañuelo, camisa de Ao Po'i, pantalón recto y faja. El femenino lleva Typói (blusa de Ao po'i con encaje ju) y falda ancha y larga.</li>
          </ul>

          <h3 className="text-purple-400">VI. Géneros Folkóricos y Rituales</h3>
          <p>El libro describe varios géneros y tradiciones populares:</p>
          <ul>
            <li><strong>El Compuesto:</strong> Es un género poético narrativo que relata hechos trágicos, épicos o dramáticos (como crónicas policiales), generalmente de autor anónimo. Musicalmente, se canta con cualquier melodía tradicional paraguaya (polca, guarania, rasguido doble). Ejemplos famosos son El karãu y Mateo Gamarra.</li>
            <li><strong>El Jejuvykue Jera:</strong> Género folklórico de carácter ritual (la liberación del anudado). Nació por la escasez de varones tras la Guerra Grande. Se trata de una ceremonia de compromiso matrimonial simbólico, que comienza cuando una joven le da un presente (una cruz de oro atada con una cinta) a un joven, quien simbólicamente queda "ahorcado" (ojejuvy) hasta que cumple con la promesa de la celebración y posterior casamiento.</li>
            <li><strong>Estacioneros (Pasioneros):</strong> Grupos exclusivamente masculinos que recorren calvarios e iglesias en Semana Santa. Entonan canciones melancólicas, monódicas y a capella (con influencia del canto llano español y el canto gregoriano), generalmente con texto en guaraní, español o jopará. La participación instrumental está excluida.</li>
          </ul>

          <h3 className="text-purple-400">VII. Géneros y Estilos de la Música Popular Paraguaya</h3>
          <p>La música popular paraguaya surge de la fusión de influencias guaraníes y europeas. Se caracteriza por el ritmo ternario, sincopado, birrítmico o polirrítmico (contraste de acentos rítmicos entre melodía y acompañamiento, generalmente en compás de 6/8).</p>
          <ul>
            <li><strong>Polca Paraguaya:</strong> Es la forma más difundida. Posee un ritmo rápido, alegre y permanentemente sincopado. El nombre es lo único que comparte con la polca europea.</li>
            <li><strong>Guarania:</strong> Género creado por José Asunción Flores en 1925. Es una canción popular de ritmo lento, sincopado, sentimental, romántico y nostálgico. Es el tipo más importante de canción urbana paraguaya y no se presta tradicionalmente para el baile.</li>
            <li><strong>Purahéi:</strong> Nombre genérico de la canción guaraní, con un movimiento intermedio entre la guarania y la polca. Incluye el purahéi asy (canto doliente) y el purahéi joyvy (canción cantada a dúo).</li>
            <li><strong>Kyre’ŷ:</strong> Derivado de la polca, pero de mayor vigor rítmico y movimiento muy rápido, principalmente instrumental. Significa activo/brioso en guaraní y se intentó usar como sustituto de "polca".</li>
            <li><strong>Rasguido Doble:</strong> Género derivado de la habanera, de ritmo binario, acompañado con el rasguido de la guitarra.</li>
            <li><strong>Avanzada:</strong> Creado por Oscar Nelson Safuán en la década de 1980, es una fusión de guarania y polca, con influencias de la música popular brasileña (bossa nova) y el uso de instrumentación mixta (autóctona y electrónica).</li>
          </ul>

          <h3 className="text-purple-400">VIII. Agrupaciones Tradicionales</h3>
          <p>El panorama musical paraguayo se ha desarrollado a través de diversas agrupaciones:</p>
          <ul>
            <li><strong>El Cantor Popular o “El Arribeño”:</strong> Músico empírico, identificado con el sentir colectivo, que difunde la música autóctona con su guitarra.</li>
            <li><strong>Pequeños Grupos Nativos:</strong> Dúos, tríos o cuartetos que amenizaban serenatas y fiestas familiares, utilizando el arpa paraguaya, la vihuela, el tiple y la guitarra.</li>
            <li><strong>Conjuntos Tradicionales:</strong> Agrupaciones que utilizaban instrumentos aculturados, incluyendo el ravel (violín artesanal), el mbaraka, el arpa, la guitarra, el contrabajo y la flauta traversa.</li>
            <li><strong>Bandas:</strong> Incluyen la Pequeña Banda “Hyekue” (grupos reducidos con instrumentos épicos y marciales, populares en fiestas patronales), la Banda Campesina o “Koygua” (agrupaciones municipales más organizadas y completas) y la Banda Folklórica (resurgimiento institucionalizado, predominio de músicos académicos).</li>
            <li><strong>Orquesta Típica:</strong> Surgió en las décadas de 1920 y 1930 con la llegada de músicos europeos. Incorporó instrumentos como acordeones, piano y bandoneón, siendo fundamental para el desarrollo orquestal y la consolidación de la música nacional.</li>
          </ul>

          <h3 className="text-purple-400">IX. Zarzuela Paraguaya</h3>
          <p>Es un género de teatro mixto (diálogo hablado y cantado con acompañamiento orquestal), inspirado en la zarzuela española. Nace oficialmente en 1956 por iniciativa de Juan Carlos Moreno González (música) y Manuel Frutos Pane (libreto). Sus obras, como La Tejedora de ñandutí (1956), fueron grandes éxitos de taquilla. El género se define por su temática extraída del folklore nacional o regional.</p>

          <h3 className="text-purple-400">X. Compositores Paraguayos del Siglo XX</h3>
          <p>El libro dedica una sección extensa a los compositores más importantes:</p>
          <ul>
            <li><strong>Agustín Pío Barrios Mangoré (1885-1944):</strong> El músico paraguayo más universal y gran creador de la escuela guitarrística americana. Su obra refleja tres estilos: el barroco de Bach, el romántico de Chopin y la influencia hispanoamericana (aires nacionales y folklore paraguayo). Obras destacadas: Las Abejas, Danza Paraguaya, La Catedral.</li>
            <li><strong>José Asunción Flores (1904-1972):</strong> Figura clave de la música popular, creador de la Guarania en 1925. También fue pionero en el campo sinfónico. Obras: Jejuí, India, Ne rendápe aju (Guaranias), y poemas sinfónicos como Pyhare Pyte.</li>
            <li><strong>Herminio Giménez (1905-1991):</strong> Dirigió la orquesta del Comando durante la Guerra del Chaco. Su canción Cerro Corá fue declarada Canción Nacional en 1944. Abordó obras sinfónicas (El Rabelero, La Epopeya) y populares (Alto Paraná, Lejanía).</li>
            <li><strong>Carlos Lara Bareiro (1914-1987):</strong> Músico de alta formación académica, estudió en Brasil. Dirigió la Orquesta Sinfónica de la Asociación de Músicos del Paraguay. Obras: Suite Paraguaya, Gran Guarania en Do mayor.</li>
            <li><strong>Emilio Biggi (1910-1969):</strong> Bandoneonista y compositor, su obra sinfónica más importante es el poema Renacer Guaraní.</li>
            <li><strong>Juan Max Boettner (1899-1958):</strong> Médico y músico, pionero en la musicología y documentación de la música indígena. Obras: Suite guaraní, Sinfonía en Mi menor.</li>
            <li><strong>Juan Carlos Moreno González (1916-1983):</strong> Compositor que co-creó la Zarzuela Paraguaya. Obras sinfónicas (Kuarahy mimby) y zarzuelas (La tejedora de Ñandutí).</li>
            <li><strong>Remberto Giménez (1898-1977):</strong> Violinista de formación europea, reorganizador musical en Paraguay. Reconstruyó la versión oficial del Himno Nacional. Fundador y director de la Orquesta Sinfónica de la Ciudad de Asunción (OSCA). Obras: Rapsodia Paraguaya, Marcha Presidencial.</li>
            <li><strong>Florentín Giménez (1925-2009):</strong> Continuó la labor de Remberto Giménez en la OSCA, y fue fundador del Conservatorio Nacional de Música. Es autor de la primera ópera paraguaya, Juana de Lara, y varias sinfonías.</li>
            <li><strong>Mauricio Cardozo Ocampo (1907-1982):</strong> Enfocado en la composición de música de inspiración folklórica y el estudio del folklore paraguayo. Obras: Galopera, Pueblo Ybycuí, Guavirá poty.</li>
            <li><strong>Eladio Martínez (1912-1990):</strong> Guitarrista y cantante, formó el célebre dúo Martínez-Cardozo. Obras: Lucerito alba, Oración a mi amada.</li>
            <li><strong>Demetrio Ortíz (1916-1975):</strong> Alcanzó fama internacional. Obras: Recuerdos de Ypacaraí, Mis noches sin ti.</li>
            <li><strong>Félix Pérez Cardozo (1908-1952):</strong> Figura cumbre en la interpretación y desarrollo del arpa paraguaya, expandiendo su espectro sonoro y técnica. Su versión de Guyra campana (Pájaro campana) es mundialmente famosa.</li>
            <li><strong>Maneco Galeano (1945-1980):</strong> Cantautor y periodista, alineado con el Nuevo Cancionero Latinoamericano. Su estilo se caracteriza por la ironía, la sencillez melódica y el compromiso con causas populares. Obras: Yo soy de la Chacarita, Poncho de 60 listas, La Chuchi.</li>
          </ul>

          <h3 className="text-purple-400">XI. El Movimiento del Nuevo Cancionero en Paraguay</h3>
          <p>Surgido en la década de 1970, este movimiento de jóvenes músicos se inscribió en la línea del Cancionero Latinoamericano. Ganó difusión entre universitarios y jóvenes durante la dictadura de Stroessner gracias al espíritu contestatario de sus textos, con letras de poetas como Elvio Romero y Augusto Roa Bastos. Maneco Galeano, Carlos Noguera y Jorge Garbett son representantes destacados.</p>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-purple-400 hover:text-purple-300 text-lg">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TemarioPage;