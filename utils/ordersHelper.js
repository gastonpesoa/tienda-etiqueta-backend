const calculateTotalCost = (items) => {
    const totalCost = items.reduce((accumulator, item) => {
        return accumulator + (item.price * parseInt(item.unit));
    }, 0)
    return totalCost;
}

module.exports = { calculateTotalCost }