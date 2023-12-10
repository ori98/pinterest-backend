exports.getPagination = (page, size) => {
    let limit = size ? +size : 0;
    const offset = page > 1 ? (page - 1) * size : 0;

    // const limit = size ? + size : 0;
    // const offset = page ? page * limit : 0;

    // const offset = page * size;
    // const limit = size;

    return {limit, offset};
};

exports.getPaginationDatatable = (page, size) => {
    const limit = size ? +size : 0;
    const offset = page ? page * limit : 0;
    return {limit, offset};
};


exports.getPagingData = (data, page, limit) => {
    let sequenceStart = limit * (page - 1) + 1
    const {count: totalItems, rows: dataValues} = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    for (let i = 0; i < dataValues.length; i++) {
        dataValues[i].dataValues["serial_number"] = sequenceStart++
    }
    return {totalItems, dataValues, totalPages, currentPage};
};
