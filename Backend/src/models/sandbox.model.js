import mongoose from "mongoose";

const sandboxRunSchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },

    runId:{
        type:String,
        required:true,
        unique:true,
        index:true
    },

    method:{
        type:String,
        required:true,
        enum:[
            "razorpay",
            "upi",
            "phonepe",
            "cashfree",
            "paytm",
            "neft"
        ]
    },

    status:{
        type:String,
        enum:[
            "validating",
            "validation_failed",
            "running",
            "completed",
            "failed"
        ],
        default:"validating"
    },

    config:{
        type:mongoose.Schema.Types.Mixed,
        default:{}
    },

    codeSnapshot:{
        frontend:{
            type:String,
            default:null
        },

        backend:{
            type:String,
            default:null
        }
    },

    validationErrors:[
        {
            field:String,
            code:String,
            message:String,
            expected:String,
            received:mongoose.Schema.Types.Mixed
        }
    ],

    transactionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Transaction",
        default:null
    },

    result:{
        type:String,
        enum:[
            "success",
            "failure",
            "timeout",
            null
        ],
        default:null
    },

    durationMs:{
        type:Number,
        default:null
    }
},
{
    timestamps:true
});

export default mongoose.model(
    "SandboxRun",
    sandboxRunSchema
);