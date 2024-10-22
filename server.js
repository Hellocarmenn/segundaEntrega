const express = require('express');
const { engine } = require('express-handlebars'); // Cambiado aquí
const { Server } = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Cambiar la configuración del motor de plantillas
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true }));

let productos = []; // Array para almacenar productos

// Rutas
app.get('/', (req, res) => {
    res.render('home', { productos });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { productos });
});

// Manejo de conexiones de WebSocket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Emitir la lista de productos al nuevo cliente
    socket.emit('updateProducts', productos);

    // Recibir producto nuevo
    socket.on('newProduct', (producto) => {
        productos.push(producto);
        io.emit('updateProducts', productos); // Emitir a todos los clientes
    });

    // Recibir producto eliminado
    socket.on('deleteProduct', (index) => {
        productos.splice(index, 1);
        io.emit('updateProducts', productos); // Emitir a todos los clientes
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
