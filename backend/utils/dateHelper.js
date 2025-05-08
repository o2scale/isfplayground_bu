
// using date-fns validate the given string is a valid date
exports.isValidDate = (dateString) => {
    return !isNaN(new Date(dateString));
}