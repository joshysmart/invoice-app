const letters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const numbs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

function genId() {
  const numpart = "XX".replace(
    /[X]/g,
    () => numbs[Math.floor(Math.random() * 9)]
  );
  const alphpart = "XXXX".replace(
    /[X]/g,
    () => letters[Math.floor(Math.random() * 25)]
  );

  return numpart + alphpart;
}

// const usedId = new Set()
// for (let i = 0; i < 100000; i++) {
//   usedId.add(genId())
// }
// console.log(usedId.size)

export default genId();
