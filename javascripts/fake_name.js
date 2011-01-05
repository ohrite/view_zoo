var fakeName = (function(){
  var surnames = [
    "Jed", "Rob", "Haggar", "Moon", "Leigh", "Paul", "Rowan", "Stephan",
    "Jordan", "Michael", "Thomas", "Michelle", "Kris", "Itchy"
  ];

  var families = [
    "Braun", "Hammer", "Honda", "Michaels", "Robson", "Krupp", "Stevens",
    "Laporte", "Simonoff", "Rainbow", "Karimov"
  ];
  
  return function(parameter) {
    var surname, family;
    
    if (parameter) {
      surname = parameter % (surnames.length - 1);
      family = parameter % (families.length - 1);
    } else {
      surname = Math.floor(Math.random() * (surnames.length - 1));
      family = Math.floor(Math.random() * (families.length - 1));
    }
    
    return { first_name: surnames[surname], last_name: families[family] };
  }
})();
