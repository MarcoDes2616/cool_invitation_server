const paginate = async ({
    model,
    where = {},
    attributes = null,
    include = [],
    order = [['id', 'DESC']],
    page = 1,
}) => {
    
    page = parseInt(page, 10) || 1;
    limit = 10;

    const offset = (page - 1) * limit;

    const { count, rows } = await model.findAndCountAll({
        where, attributes, include, order, limit, offset,
    });

    const totalPages = Math.ceil(count / limit);

    return {
        results: rows,
        currentPage: page,
        totalPages,
        totalItems: count,
    };
};

module.exports = paginate;
