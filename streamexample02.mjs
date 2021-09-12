/* 
  O pipe tradicional do nodejs é perigoso, pois imagine que você tenha varios
  pipes e um desses pipes dê erro no processo, ele não é capaz de resolver os
  erros sozinho e isso acaba gerando vazamento de memória. Para resolver isso,
  podemos usar a função pipeline do módulo stream do nodejs
*/


import { pipeline, Readable, Transform, Writable } from "stream";
import { promisify } from "util";
import { createWriteStream } from "fs";

/* 
  Transformando a função pipeline que trabalha com callback em uma promise
  para que seja possível usar o await
*/
const pipelineAsync = promisify(pipeline);
{
  /* 
    Criando a fonte de dados, o readable stream
  */
  const readableStream = Readable({
    read: function() {
      this.push("Hello Dude!! 0");
      this.push("Hello Dude!! 1");
      this.push("Hello Dude!! 2");
      // Para falar que o processo acabou, faça um this.push(null)
      this.push(null);
    }
  });

  /*
    Criando a saida de dados, o writable stream 
  */
  const writableStream = Writable({
    write: function(chunk, encoding, callback) {
      console.log("msg", chunk.toString()); // chunk é um buffer, então convertermos para string
      callback();
    }
  });

  /*
    Aqui ocorre as etapas citadas no howToDo.txt para tratar os chunks de dados
  */
  await pipelineAsync (
    readableStream,
    // process.stdout (stdout é um writableStream, no caso é a saida do terminal)
    writableStream
  );

  console.log("Processo 01 acabou");
} // fim do exemplo 01

// inicio do exemplo 02
{
  // Criando massa de dados ficticia usando o readableStream
  const readableStream = Readable({
    read: function() {
      // 1e5 = 100000
      for (let index = 0; index < 1e5; index++) {
        const person = { id: Date.now() + index, name: `Matheus-${index}` }
        const data = JSON.stringify(person);
        this.push(data);
      }
      // Avisa que acabaram os dados
      this.push(null);
    }
  }); 

  // Manipulando dados com o Transform (Mapeando itens para um CSV)
  const writableMapToCSV = Transform({
    // Cada push do readableStream irá cair no Transform
    transform: function(chunk, encoding, callback) {
      // Convertendo JSON string para object
      const data = JSON.parse(chunk);
      const result = `${data.id},${data.name.toUpperCase()}\n`;

      // Passando o dado para a frente (para o WritableStream)
      // callback params is (error, success)
      callback(null, result);
    }
  });
  
  /* 
    Insere no inicio do arquivo que queremos colocar o cabeçalho
    indicando quem será o id e quem será o name
  */
  const setHeader = Transform({
    transform: function(chunk, encoding, callback) {
      // Se não tiver dado nenhum, se ele não foi definido, irá receber 0
      this.counter = this.counter ?? 0;

      // Se counter > 0 (Significa que já tem um cabeçalho)
      if(this.counter) {
        // Só retorna o chunk, não precisa adicionar o cabeçalho porque já tem
        return callback(null, chunk);
      }
      
      // Incrementa o counter para avisar que agora possui um cabeçalho
      this.counter += 1;
      
      // Adiciona o cabeçalho
      callback(null, "id,name\n".concat(chunk));
    }
  });
  
  await pipelineAsync(
    readableStream,
    writableMapToCSV,
    setHeader,
    // process.stdout
    // Criando um writable stream para saida dos dados
    createWriteStream("my.csv")
  );
}
