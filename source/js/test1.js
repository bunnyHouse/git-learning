(function () {
    function concat(a, b) {
        return [...a, ...b];
    }
    // 用ES6扩展运算符实现合并数组操作
    console.log(concat([1, 2, 3], [4, 5, 6]));
})();
