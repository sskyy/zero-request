# zero-request #

This module user let you use basic express router functions.

## Usage ##

1. Add dependency to your module package.json file like:

```
{
	"name" : "YOUR_MODULE_NAME",
	"zero" : {
		"dependencies" : {
			"request" : "^0.0.1"
		}
	}
}
```

2. Declare `route` in model definition like:

```
module.exports = {
    route : {
        "GET /anyUrl" : function( req, res){
            //use it just like express router
        },
        "GET /runInOrderUrl" : {
            "function" : function functionName(req, res){
                //this handler will run before otherModule.otherFunctionName
            },
            "order" : {
                before : "otherModule.otherFunctionName"
            }
        },
        "GET /fireEvent" : function (req, res){
            //with bus module loaded, you can use req.bus to fire event
            req.bus.fire("someEvent")
        },
        "GET /fcall" : function( req, res){
            //bus.fcall will help you fire event before and after your main business logic
            req.bus.fcall("someEvent", arg1, arg2, function(){
                //deal what you want to do
            })
        }
    }
}
```

We strongly suggest you use `bus.fire` or `bus.fcall` to trigger the action you want, this will decouple your system in an elegant way.
When you use bus, you may need to know how respond module handle responds.
