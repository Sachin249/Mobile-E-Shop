// const deleteProduct = (btn) =>{
//     const productId = btn.parentNode.querySelector('[name=productId]').value;
//     console.log(productId)
//     // const csrf =  btn.parentNode.querySelector('[name=_csrf]').value;
//     // productElement = btn.closest('article');
//     fetch('/admin/admin-product-delete' + productId, {
//         method:'DELETE',
//         // headers:{
//         //     'csrf-token' : csrf
//         // }
//     })
//     .then(result=>{
//         return result.json();
//     })
//     .then(data=>{
//         console.log(data);
//         // productElement.parentNode.removeChild(productElement);
//     })
//     .catch(err => {
//         console.log(err);
//     });
// }