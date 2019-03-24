const convertToArrSort = async (str_sort) => {
    let sort = [];
    if(str_sort) {
        let strSort = str_sort;
        let arrTempSort = await strSort.split(',');
        arrTempSort.forEach(item => {
            sort.push(item.split('.'));
        });   
    }
    return sort;
}

module.exports = convertToArrSort;
