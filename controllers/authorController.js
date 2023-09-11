const Author = require("../models/author");
const Book = require("../models/book")
const asyncHandler = require("express-async-handler")
const { body, validationResult } = require("express-validator")

//Display list of all authors
exports.author_list = asyncHandler(async(req,res,next) => {
    // res.send("NOT IMPLEMENTED: Author list")
    const allAuthors = await Author.find().sort({
        family_name: 1
    }).exec()
    res.render("author_list", {
        title:"Author List",
        author_list: allAuthors
    })
})

//Display detail page for specific author
exports.author_detail = asyncHandler(async (req,res,next) => {
    // res.send(`NOT IMPLEMENTED: Author detail: ${req.params.id}`)
    const [author, allBooksByAuthor]=await Promise.all([
            Author.findById(req.params.id).exec(),
            Book.find({author:req.params.id}, "title summary").exec()
        ])

        if(author===null){
            const err = new Error("Author not found")
            err.status = 404
            return next(err)
        }

        res.render("author_detail", {
            title: "Author Detail",
            author: author,
            author_books: allBooksByAuthor
        })
    })


//Display author create form on GET
exports.author_create_get = (req,res,next) => {
    // res.send("NOT IMPLEMENTED: Author create GET")
    res.render("author_form", { title: "Create Author"})
}

//Handle author create on POST
exports.author_create_post = [
    //validate and sanitize fields
    body("first_name")
        .trim()
        .isLength({ min:1 })
        .escape()
        .withMessage("First name must be specified.")
        .isAlphanumeric()
        .withMessage("First name has a non-alphanumeric characters"),
    
    body("family_name")
        .trim()
        .isLength({ min:1 })
        .escape()
        .withMessage("Family naem must be specified")
        .isAlphanumeric()
        .withMessage("Family name has non-alphanumeric characters"),
    
    body("date_of_birth", "Invalid date of birth")
        .optional({ values:"falsy"})
        .isISO8601()
        .toDate(),

    body("date_of_death", "invalid date of death")
        .optional({ values:"falsy" })
        .isISO8601()
        .toDate(),

    //Process request after validation and sanitization
    asyncHandler(async (req,res,next) => {
        //extract validation errors from request
        const errors = validationResult(req)

        //create author object with escaped and trimmed data
        const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
        })

        if(!errors.isEmpty()){
            //there are errors. Render the form again with sanitiZed values/error messages
            res.render("author_form", {
                title:"Create Author",
                author:author,
                errors:errors.array()
            })
            return;
        }
        else{
            //data from form is valid
            //save author
            await author.save()
            //redirect to new author record
            res.redirect(author.url)
        }
    })
]

//Display author delete form on GET
exports.author_delete_get = asyncHandler(async (req,res,next) => {
    // res.send("NOT IMPLEMENTED: Author delete GET")
    //get details of the author and all their books
    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({ author:req.params.id }, "title summary").exec()
    ])

    if(author ===null ){
        res.redirect("/catalog/authors")
    }

    res.render("author_delete", {
        title: "Delete Author",
        author: author,
        author_books: allBooksByAuthor
    })
})

//Handle author delete on POST
exports.author_delete_post = asyncHandler(async (req,res,next) => {
    // res.send("NOT IMPLEMENTED: Author delete POST")
    //get details of author and all their books 
    const [author,allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({ author:req.params.id }, "title summary").exec()
    ])

    if(allBooksByAuthor.length > 0){
        //Author has books. Render in same way as for GET route
        res.render("author_delete", {
            title: "Delete Author",
            author:author,
            author_books: allBooksByAuthor
        })
        return
    }else{
        //Author has no books. Delete object and redirect to the list of authors
        await Author.findByIdAndRemove(req.body.authorid)
        res.redirect("/catalog/authors")
    }
})

exports.author_update_get = asyncHandler(async (req,res,next) =>{
    res.send("NOT IMPLEMENTED: Author update GET")
})

exports.author_update_post = asyncHandler(async (req,res,next) => {
    res.send("NOT IMPLEMENTED: Author update POST")
})