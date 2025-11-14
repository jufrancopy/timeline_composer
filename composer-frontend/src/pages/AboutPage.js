import React from 'react';
import profImage from '../prof.jpeg'; // Asegúrate de que la ruta sea correcta

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Sección de Introducción al Sistema */}
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
            EduPlatForm: Innovación Educativa en Tus Manos
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            TimeLine Composer es una plataforma educativa colaborativa diseñada para transformar la experiencia de aprendizaje y enseñanza. Facilitamos la gestión académica, la creación de contenidos interactivos y la colaboración en tiempo real, impulsando un entorno dinámico y enriquecedor para estudiantes y docentes.
          </p>
        </section>

        {/* Características del Sistema */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-purple-400 mb-10">¿Qué Ofrecemos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-slate-800/50 rounded-xl p-8 shadow-lg border border-purple-500/30 hover:shadow-purple-500/20 transition-all duration-300">
              <h3 className="text-xl font-semibold text-pink-400 mb-4">Gestión Académica Centralizada</h3>
              <p className="text-slate-300">Control total sobre cursos, alumnos, calificaciones y asistencias. Simplifica la administración y permite a los docentes enfocarse en lo que realmente importa: la enseñanza.</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-8 shadow-lg border border-pink-500/30 hover:shadow-pink-500/20 transition-all duration-300">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Aprendizaje Colaborativo e Interactivo</h3>
              <p className="text-slate-300">Herramientas para la creación de líneas de tiempo, tareas y evaluaciones que fomentan la participación activa y el trabajo en equipo entre los estudiantes.</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-8 shadow-lg border border-purple-500/30 hover:shadow-purple-500/20 transition-all duration-300">
              <h3 className="text-xl font-semibold text-pink-400 mb-4">Seguimiento Detallado del Progreso</h3>
              <p className="text-slate-300">Evaluaciones personalizadas, rankings y analíticas para monitorear el desempeño estudiantil y adaptar las metodologías de enseñanza de forma efectiva.</p>
            </div>
          </div>
        </section>

        {/* Sección del Creador - Profesor Julio Franco */}
        <section className="bg-slate-800/60 rounded-xl p-8 md:p-12 shadow-2xl border border-purple-500/50">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-10">Conoce al Creador</h2>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            <div className="flex-shrink-0">
              <img 
                src={profImage} 
                alt="Profesor Julio Franco" 
                className="w-48 h-48 object-cover rounded-full border-4 border-purple-500 shadow-xl"
              />
            </div>
            <div className="text-center md:text-left flex-grow">
              <h3 className="text-3xl font-semibold text-white mb-2">Profesor Julio Franco</h3>
              <p className="text-lg text-slate-400 mb-6">Licenciado en Filosofía, Didáctica Universitaria, Profesor Elemental de Música (Violoncello), Multinstrumentista y Fundador de la Orquesta Filarmónica Ipu Paraguay.</p>
              
              <p className="text-slate-300 mb-4 leading-relaxed">
                Mi compromiso es con la formación integral a través del arte y el pensamiento crítico. Con una amplia trayectoria en el ámbito musical como arreglador, orquestador y compositor, he fundado la Orquesta Filarmónica Ipu Paraguay, cultivando la pasión por la música.
              </p>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Además, mi entusiasmo por la investigación tecnológica me ha llevado a desarrollar competencias en múltiples lenguajes de programación, aplicando este conocimiento para crear soluciones innovadoras como TimeLine Composer.
              </p>
              
              <div className="mt-6">
                <h4 className="text-xl font-semibold text-pink-400 mb-3">Mis Áreas de Especialización:</h4>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300">
                  <li className="flex items-center gap-2 bg-purple-600/20 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="text-purple-300">🎻</span> Violoncello
                  </li>
                  <li className="flex items-center gap-2 bg-pink-600/20 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="text-pink-300">指揮</span> Dirección Orquestal
                  </li>
                  <li className="flex items-center gap-2 bg-green-600/20 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="text-green-300">🧠</span> Filosofía
                  </li>
                  <li className="flex items-center gap-2 bg-blue-600/20 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="text-blue-300">💻</span> Programación
                  </li>
                  <li className="flex items-center gap-2 bg-yellow-600/20 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="text-yellow-300">🎶</span> Composición
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
