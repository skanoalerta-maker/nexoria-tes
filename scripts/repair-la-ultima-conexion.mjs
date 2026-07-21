import fs from 'node:fs';

const file = 'novelas/terror/la-ultima-conexion/temporada1/capitulo11.html';
let html = fs.readFileSync(file, 'utf8');

const story = `          <div class="story">
            <p class="lead">La copia de la llave volvió a rozar la cerradura desde el pasillo. Daniel sostuvo la suya desde dentro, con los dedos entumecidos y la espalda pegada a la puerta. Después de tantas voces falsas, aquel choque de metales era la primera amenaza que no necesitaba una pantalla para existir.</p>

            <div class="quote">—Daniel —dijo Jorge al otro lado—. Si sigues bloqueando la puerta, él va a salir por el clóset.</div>

            <p>Daniel miró hacia la oscuridad del armario. No respondió. La voz conocía el nombre de Jorge, su manera de cortar las frases y hasta el silbido leve que dejaba escapar al respirar. Precisamente por eso no podía confiar en ella.</p>
            <p>—Dime qué hicimos el día del apagón —exigió Daniel.</p>
            <p>La respuesta llegó sin demora: la bicicleta rota, la lluvia y una promesa infantil que nunca habían contado a nadie. Todo era correcto salvo por un detalle. Jorge no había perdido la bicicleta; había sido Daniel.</p>

            <div class="quote">La presencia no recordaba. Reconstruía.</div>

            <p>Daniel entendió que cada mensaje, audio y videollamada de la noche había servido para reunir fragmentos. El teléfono no solo lo vigilaba: lo interrogaba sin preguntas, registraba sus reacciones y corregía sus imitaciones.</p>
            <p>La voz del pasillo repitió la anécdota, esta vez cambiando el detalle equivocado. Ya estaba aprendiendo.</p>

            <div class="divider"></div>

            <p>Desde el clóset llegó un golpe seco. Después otro. La madera se arqueó hacia fuera y una línea negra apareció entre las puertas.</p>
            <p>—No puedes vigilar los dos accesos —susurró la voz de Daniel desde el armario.</p>
            <p>Era cierto. Si soltaba la llave, el pasillo entraría. Si se apartaba de la puerta para cerrar el clóset, también tendría que soltarla.</p>
            <p>Entonces recordó la primera regla que había descubierto: las apariciones ganaban terreno cuando él obedecía la urgencia que ellas mismas creaban.</p>

            <div class="quote">No tenía que elegir una puerta. Tenía que dejar de responder al juego.</div>

            <p>Daniel apagó la linterna y cerró los ojos. Mantuvo la mano sobre la llave, pero dejó de mirar el clóset. Respiró cuatro veces, despacio, mientras ambas voces intentaban precipitarlo.</p>
            <p>Jorge pidió ayuda. Su madre lloró. Su propia voz comenzó a enumerar recuerdos que nadie debería conocer. Daniel escuchó los errores escondidos entre las certezas: una fecha desplazada, un color cambiado, una frase pronunciada por la persona equivocada.</p>
            <p>No eran recuerdos completos. Eran archivos comprimidos con espacios vacíos.</p>

            <div class="divider"></div>

            <p>Abrió los ojos cuando el teléfono roto vibró sobre el suelo. La pantalla no encendió, pero entre los fragmentos apareció una línea blanca:</p>

            <div class="quote">VALIDACIÓN 91 % — SUJETO AÚN NO SUSTITUIBLE</div>

            <p>La palabra lo heló más que cualquier amenaza anterior. No querían matarlo. Querían completar una versión capaz de ocupar su lugar.</p>
            <p>Daniel presionó la llave y habló por primera vez sin dirigirse a ninguna de las voces.</p>
            <p>—Si necesitan que reaccione para terminar la copia, se van a quedar esperando.</p>

            <p>El clóset dejó de moverse. La llave exterior se retiró unos centímetros. Durante un instante, la habitación pareció contener la respiración.</p>

            <div class="quote">VALIDACIÓN PAUSADA</div>

            <p>La victoria duró apenas un segundo. Debajo del mensaje apareció una nueva línea:</p>

            <div class="quote">INICIANDO EVALUACIÓN DE SALIDA</div>

            <p>Daniel comprendió que había impedido la copia, pero también había activado otra fase. Ya no estaban intentando convencerlo de abrir.</p>
            <p>Ahora iban a decidir cuál de las dos versiones tenía derecho a abandonar la habitación.</p>
          </div>
        </div>`;

const pattern = /          <div class="story">[\s\S]*?          <\/div>\s*        <\/div>(?=\s*\n\s*<div class="reader-bottom">)/;
if (!pattern.test(html)) throw new Error('Story block not found');
html = html.replace(pattern, story);
fs.writeFileSync(file, html, 'utf8');
console.log('Repaired La última conexión, chapter 11.');
