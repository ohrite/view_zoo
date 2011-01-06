var fakeName = (function(){
  var surnames = [
    "Joe", "Mary", "Jane", "Jed", "Rob",
    "Haggar", "Moon", "Leigh", "Paul", "Rowan",
    "Stephan", "Jordan", "Michael", "Thomas", "Michelle",
    "Kristin", "Itchy"
  ];

  var families = [
    "Smith", "Jones", "Braun", "Hammer", "Honda",
    "Michaels", "Robson", "Krupp", "Stevens", "Laporte",
    "Simonoff", "Rainbow", "Karimov"
  ];
  
  return function(parameter) {
    var surname, family;
    
    if (parameter) {
      surname = parameter % (surnames.length);
      family = parameter % (families.length);
    } else {
      surname = Math.floor(Math.random() * (surnames.length));
      family = Math.floor(Math.random() * (families.length));
    }
    
    return { first_name: surnames[surname], last_name: families[family] };
  }
})();
