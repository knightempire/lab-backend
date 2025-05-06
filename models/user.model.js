const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            match: /^\S+@\S+\.\S+$/ // Ensures valid email format
        },

        rollNo: {
            type: String,
            required: true,
            unique: true
        },

        phoneNo: {
            type: String,
            required: true,
            match: /^[0-9]{10}$/ // Ensures 10-digit phone number
        },

        password: {
            type: String,
            required: true,
            minlength: 8
        },

        isFaculty: {
            type: Boolean,
            required: true
        },

        isAdmin: {
            type: Boolean,
            required: true
        },

        isActive: {  
            type: Boolean,
            default: true 
        }
    },
    {
        timestamps: true // Automatically add createdAt and updatedAt fields
    }
);
