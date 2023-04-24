class Complex {
  constructor(re = 0, im = 0) {
    this.re = re;
    this.im = im;
  }
}

class Matrix extends Array {
  constructor(rows, cols = rows) {
    super();
    this.rows = rows;
    this.cols = cols;
    this.storage = [];
  }
  from(rows, cols, fn) {
    const m = new Matrix(rows, cols);
    for (let i = 0; i < this.rows; ++i) {
      for (let j = 0; j < this.cols; ++j) {
        m.storage[i][j] = fn(i, j);
      }
    }
  }
}
