// stdin -> readable stream
// pipe -> "funil" de etapa de processamento dos chunks (pedaços de um dado grande)
// stdout -> writable stream

// Como essas funcionalidades acima herdam de events, podemos fazer algo como
// const stdin = process.stdin
//   .on("data", msg => console.log("entrada terminal", msg.toString()));

// const stdout = process.stdout
//   .on("data", msg => console.log("saida terminal", msg.toString()));

// stdin.pipe(stdout);
// other events
// .on("error")
// .on("end")
// .on("close")


// Fornecendo arquivos sob demanda com streams em um servidor http
// import { createReadStream, readFileSync } from "fs";
// import http from "http";
// // Criando via terminal um arquivo de mais ou menos 1GB para ser servido sob demanda
// // 1e9(e é o número de zeros de um número grande)
// // node -e "process.stdout.write(crypto.randomBytes(1e9))" > big.file
// // rode curl localhost:3000 --output output.txt para ver a diferença entre eles
// /* Um (readfileSync) irá baixar o arquivo em mais pedaços, o que é menos performatico e mais custoso 
//   já o outro (createReadStream) irá baixar em mais pedaços o mesmo arquivo de 1GB (O que é mais performatico e menos custoso) 
// */
// http.createServer((request, response) => {
//   // A maneira mais comum e errada de servir um arquivo (lança erro se o arquivo for grande demais)
//   // const file = readFileSync("big.file");
//   // response.write(file);
//   // response.end();

//   // Maneira ideal de servir um arquivo (sob demanda via streams)
//   createReadStream("big.file")
//     .pipe(response);

// }).listen(3000, () => console.log("Running at 3000"));


// // Trabalhando com streams em sockets
// import net from "net";

// // Um socket é duplex stream (Tanto um readableStream quanto um writableStream)
// // Lê o dado e passa para o process.stdout e irá ouvir pela porta 1338
// net.createServer(socket => socket.pipe(process.stdout)).listen(1338);

// /* 
//   Ligando o terminal com o socket (Tudo o que for digitado em um terminal que rodar o comando abaixo, 
//   irá para o servidor que está rodando o socket (outro terminal) criado acima)
// */
// // node -e "process.stdin.pipe(require('net').connect(1338))"
