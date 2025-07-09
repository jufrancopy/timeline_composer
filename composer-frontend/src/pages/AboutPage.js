import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Línea de Tiempo Creativa
          </h1>
          <p className="text-center text-lg text-gray-300 mb-12">
            Una Plataforma Digital para Revalorizar a los Creadores de la Historia
          </p>

          <div className="space-y-10">
            <section>
              <h2 className="text-3xl font-semibold mb-4 border-b-2 border-purple-500 pb-2">Visión del Proyecto</h2>
              <p className="text-gray-300 leading-relaxed">
                Desarrollado por Julio Franco, Licenciado en Filosofía y apasionado de la Tecnología, este proyecto nace de una profunda convicción: la necesidad de revalorizar a los creadores que han moldeado nuestra historia y cultura. En un mundo donde la información se consume de manera fragmentada y superficial, esta plataforma busca reconectar a las personas con los grandes compositores, artistas, escritores y visionarios que han definido el curso de la humanidad.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold mb-4 border-b-2 border-purple-500 pb-2">El Problema que Resuelve</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                La historia de los creadores se encuentra dispersa, descontextualizada y muchas veces olvidada. Las nuevas generaciones pierden el vínculo con figuras fundamentales que sentaron las bases de nuestra cultura. Este proyecto surge como respuesta a la necesidad de:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Democratizar el acceso a la historia cultural</li>
                <li>Conectar épocas y movimientos de manera visual e intuitiva</li>
                <li>Inspirar a nuevas generaciones a través del legado creativo</li>
                <li>Preservar la memoria histórica en formato digital moderno</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold mb-4 border-b-2 border-purple-500 pb-2">Sobre el Creador</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img 
                  src="https://jufrancopy.github.io/history_music_py/prof.jpeg" 
                  alt="Profesor Julio Franco"
                  className="w-48 h-48 rounded-full object-cover border-4 border-purple-500 shadow-lg"
                />
                <div className="text-gray-300 leading-relaxed">
                  <p className="mb-4">
                    <strong>Profesor Julio Franco</strong>, licenciado en Filosofía con postgrado en Didáctica Universitaria. Profesor Elemental de Música con énfasis en Violoncello. Estoy comprometido con la formación integral a través del arte y el pensamiento crítico. Actualmente, desempeño funciones docentes en el Instituto Superior Nacional de Música, donde imparto la Cátedra de Historia del Música paraguaya, Introducción a la Filosofía y el curso de Violoncello Introductorio.
                  </p>
                  <p className="mb-4">
                    Como multinstrumentista y fundador de la Orquesta Filarmónica Ipu Paraguay, he cultivado una amplia trayectoria en el ámbito musical, actuando también como arreglador, orquestador y compositor. Entre mis experiencias destacadas se encuentra la dirección de la orquesta en obras emblemáticas, como la zarzuela paraguaya María Pacuri, y la coordinación de proyectos musicales en el Teatro Municipal Ignacio A. Pane. Tuve el honor de trabajar en los arreglos orquestales del Proyecto Beatles Sinfónico en el año 2024, con 13 transcripciones de algunas icónicas piezas de la Banda de Liverpool.
                  </p>
                  <p>
                    Además de mi pasión por la música, soy apasionado de la investigación en tecnología, desarrollando competencias en lenguajes de programación como PHP, Python, C, C#, Java y trabajando en el desarrollo de software en varios proyectos. Esta combinación de habilidades artísticas y tecnológicas me permite abordar los desafíos desde una perspectiva multidisciplinaria, promoviendo siempre la innovación y la excelencia en la formación de mis estudiantes.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-semibold mb-4 border-b-2 border-purple-500 pb-2">Reflexión Final</h2>
              <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400">
                "La tecnología debe servir para amplificar lo más noble del ser humano: su capacidad creativa y su sed de trascendencia. Este proyecto es un puente entre el pasado glorioso y el futuro esperanzador, donde cada creador del ayer inspira a los visionarios del mañana."
                <cite className="block not-italic mt-2 font-semibold">- Julio Franco</cite>
              </blockquote>
            </section>
          </div>

          <div className="text-center mt-12">
            <Link to="/" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-full py-3 px-8 shadow-lg transition-transform transform hover:scale-105">
              Volver a la Línea de Tiempo
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;
