class Adder {
  constructor(aduend){
    this.aduend = aduend;
  }

  /** Usage
   * var one = Adder(1);
   * var ten = one.addTo(9)
   */
  addTo(num){
    return this.aduend + num;
  }

  get(){
    return this.aduend;
  }
}