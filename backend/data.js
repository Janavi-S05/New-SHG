import bcrypt from 'bcryptjs';
const data={
users:[

    {
        name: 'Raina',
        email: 'admin@gmail.com',
        password: bcrypt.hashSync('123456'),
        isAdmin:true
    },

    {
        name: 'Ronaldo',
        email: 'cr7@gmail.com',
        password: bcrypt.hashSync('123456'),
        isAdmin:false
    }
],

products:[
    {
        // _id:'1',
        name:'Rice',
        slug:'sun-gate-rice',
        category:'Grains',
        image:'/images/p1.jpg',
        price:180 ,
        countInStock:10,
        brand:'Sun Gate',
        rating:'4.5',
        numReviews:10,
        description:'high quality',
    },
    {
        // _id:'2',
        name:'Wheat',
        slug:'aashirvad-wheat',
        category:'Grains',
        image:'/images/p2.jpg',
        price:120 ,
        countInStock:10,
        brand:'Aashirvaad',
        rating:'4.5',
        numReviews:10,
        description:'Good quality',
    },

    {
        //  _id:'3',
        name:'Coconut',
        slug:'coco-nut',
        category:'Grains',
        image:'/images/p3.jpg',
        price:12 ,
        countInStock:10,
        brand:'Coco',
        rating:'4.5',
        numReviews:10,
        description:'Watery',
    },

  
   

   


]

}

export default data