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
    "Simon", "Rain", "Karim"
  ];
  
  var suffixes = [
    "stein", "son", "bow", "off", "ich", "ist"
  ];
  
  var stops = ['a', 'e', 'i', 'o', 'u', 'y', 's'];
  
  function isSuffixable(letter) {
    var can = false;
    
    for (var s = 0; !can && s < stops.length; s++) {
      can = (letter.localeCompare(stops[s]) == 0);
    }
    
    return can;
  }
  
  function suffixFamily(family) {
    if (Math.round(Math.random()) == 0 && !isSuffixable(family[family.length - 1])) {
      family = family + suffixes[Math.floor(Math.random() * suffixes.length)];
    }
    
    return family;
  }
  
  return function(parameter) {
    var surname, family;
    
    if (parameter) {
      surname = parameter % surnames.length;
      family = parameter % families.length;
    } else {
      surname = Math.floor(Math.random() * surnames.length);
      family = Math.floor(Math.random() * families.length);
    }
    
    return {
      first_name: surnames[surname],
      last_name: suffixFamily(families[family])
    };
  }
})();
