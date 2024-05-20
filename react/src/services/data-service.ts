const dataService = {
  semesters: ['First', 'Second'],
  days: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Satruday',
    'Sunday',
  ],
  getYearList: function () {
    const currentYear = new Date().getFullYear();
    const resultArr = [];
    let year = 2010;
    while (year <= currentYear) {
      resultArr.push(year.toString());
      ++year;
    }
    return resultArr;
  },
};

export default dataService;
