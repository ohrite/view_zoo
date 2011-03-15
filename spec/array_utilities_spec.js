describe("ArrayUtilities", function() {
  var array;
  
  beforeEach(function() {
    array = [ 'alpha', 'charlie', 'echo', 'golf' ];
  });

  describe('#sortIndex', function() {
    it('should find the correct insertion point for an element at the start of the array', function() {
      expect(ArrayUtilities.sortIndex(array, 'aaa')).toEqual(0);
    });

    it('should find the correct insertion point for an element at the end of the array', function() {
      expect(ArrayUtilities.sortIndex(array, 'z')).toEqual(array.length);
    });

    it('should find the correct insertion point for an element in the interior of the array', function() {
      expect(ArrayUtilities.sortIndex(array, 'bravo')).toEqual(1);
      expect(ArrayUtilities.sortIndex(array, 'delta')).toEqual(2);
      expect(ArrayUtilities.sortIndex(array, 'foxtrot')).toEqual(3);
    });

    it('should find the correct index of an element already in the array', function() {
      expect(ArrayUtilities.sortIndex(array, 'alpha')).toEqual(0);
      expect(ArrayUtilities.sortIndex(array, 'golf')).toEqual(3);
    })
  });

  describe('#includes', function() {
    it('should return true if the element is found', function() {
      expect(ArrayUtilities.includes(array, 'echo')).toBeTruthy();
    });

    it('should return false if the element is not found', function() {
      expect(ArrayUtilities.includes(array, 'whiskey')).toBeFalsy();
    });

    it('should not get confused in comparisons', function() {
      expect(ArrayUtilities.includes(array, 'alphabeatdown')).toBeFalsy();
    });
  });

  describe('#insertSorted', function() {
    it('should insert a value into the array', function() {
      expect(ArrayUtilities.insertSorted(array, 'bravo')).toEqual([ 'alpha', 'bravo', 'charlie', 'echo', 'golf' ])
    });
  });

  describe('#removeSorted', function() {
    it('should remove a value from the array', function() {
      expect(ArrayUtilities.removeSorted(array, 'charlie')).toEqual([ 'alpha', 'echo', 'golf' ])
    });

    it('should not remove a non-existent value from the array', function() {
      expect(ArrayUtilities.removeSorted(array, 'whiskey')).toEqual([ 'alpha', 'charlie', 'echo', 'golf' ])
    });
  });
});