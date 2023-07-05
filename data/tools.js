const readline = require("readline");
const fs = require("fs");
const Table = require("cli-table3");
const stripAnsi = require("strip-ansi");

// Warna Teks
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[91m",
  cyan: "\x1b[96m",
  yellow: "\x1b[93m",
  green: "\x1b[92m",
};

function runPrediction() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  fs.readFile("./data/data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const jsonData = JSON.parse(data);

    rl.question(
      `${colors.yellow}Masukan Pasaran: ${colors.reset}`,
      (pasaran) => {
        // Convert Pasaran Menjadi Kapital
        pasaran = pasaran.toUpperCase();

        if (!/^[a-zA-Z]+$/.test(pasaran)) {
          console.log(
            `${colors.red}Masukan pasaran hanya boleh berupa huruf.${colors.reset}`
          );
          rl.close();
          return;
        }

        rl.question(
          `${colors.yellow}Masukkan Angka Ekor: ${colors.reset}`,
          (angka) => {
            if (!/^\d+$/.test(angka) || angka < 0 || angka >= 10) {
              console.log(
                `${colors.red}Masukkan angka antara 0 dan 9.${colors.reset}`
              );
              rl.close();
              return;
            }

            rl.question(
              `${colors.yellow}Berapa Digit (optional - default 4): ${colors.reset}`,
              (digitCount) => {
                digitCount = parseInt(digitCount) || 4;

                rl.question(
                  `${colors.yellow}Prediksi Berapa (optional - default 5): ${colors.reset}`,
                  (generateCount) => {
                    generateCount = parseInt(generateCount) || 5;

                    if (angka.toString() in jsonData) {
                      const selectedNumber = jsonData[angka.toString()];
                      const table = new Table({
                        head: [
                          `${colors.yellow}No.${colors.reset}`,
                          `${colors.yellow}Prediksi${colors.reset}`,
                        ],
                        chars: {
                          mid: "",
                          "left-mid": "",
                          "mid-mid": "",
                          "right-mid": "",
                        },
                        style: { head: ["yellow"], border: ["yellow"] },
                      });

                      for (let i = 1; i <= generateCount; i++) {
                        const randomDigits = getRandomDigits(
                          selectedNumber,
                          digitCount
                        );
                        table.push([i.toString(), randomDigits]);
                      }

                      console.log(
                        `${colors.cyan}\nHasil Prediksi ${pasaran}\n${colors.reset}`
                      );
                      console.log(table.toString());
                      console.log(
                        `${colors.cyan}\nTerima kasih telah menggunakan tools saya${colors.reset}`
                      );

                      const result = table.toString();

                      // Menghapus karakter ANSI dari hasil
                      const plainResult = stripAnsi(result);

                      rl.question(
                        `${colors.yellow}Apakah Anda ingin menyimpan hasil prediksi ke dalam file? (y/n): ${colors.reset}`,
                        (saveToFile) => {
                          if (saveToFile.toLowerCase() === "y") {
                            // Menyimpan hasil ke dalam file
                            const fileName = `${pasaran}-${angka}-${getDate()}.txt`;
                            const fileSave = `./prediksi/${fileName}`;
                            const fileContent = `Hasil Prediksi ${pasaran}\n\n${plainResult}\n\nTerima kasih telah menggunakan tools saya`;

                            // Mengecek apakah folder prediksi sudah ada atau belum
                            const folderPath = "./prediksi";
                            if (!fs.existsSync(folderPath)) {
                              fs.mkdir(
                                folderPath,
                                { recursive: true },
                                (err) => {
                                  if (err) {
                                    console.error(err);
                                    return;
                                  }
                                  saveFile(fileSave, fileContent, fileName);
                                }
                              );
                            } else {
                              saveFile(fileSave, fileContent, fileName);
                            }
                          } else {
                            // Menampilkan hasil di terminal
                            console.log(
                              `${colors.cyan}\nHasil prediksi ${pasaran}\n${plainResult}\n${colors.reset}`
                            );
                            console.log(
                              `${colors.cyan}\nTerima kasih telah menggunakan tools saya${colors.reset}`
                            );
                          }

                          rl.close();
                        }
                      );
                    } else {
                      console.log(
                        `${colors.red}Data tidak ada.${colors.reset}`
                      );
                      rl.close();
                    }
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

function saveFile(fileSave, fileContent, fileName) {
  fs.writeFile(fileSave, fileContent, "utf8", (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(
      `${colors.yellow}Hasil prediksi telah disimpan di file ${colors.green}${fileName}${colors.reset}`
    );
  });
}

function getRandomDigits(number, count) {
  const digits = number.toString().split("");
  const randomDigits = [];
  const digitSet = new Set(digits);

  while (randomDigits.length < count && digitSet.size > 0) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    const randomDigit = digits[randomIndex];

    if (digitSet.has(randomDigit)) {
      randomDigits.push(randomDigit);
      digitSet.delete(randomDigit);
    }
  }

  while (randomDigits.length < count) {
    const randomDigit = Math.floor(Math.random() * 10).toString();
    randomDigits.push(randomDigit);
  }

  return randomDigits.join("");
}

function getDate() {
  const date = new Date();
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${day}-${month}-${year}`;
}

module.exports = { run: runPrediction };
