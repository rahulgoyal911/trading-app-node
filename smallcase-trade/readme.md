documentation: https://documenter.getpostman.com/view/3908963/TzCFgqQk

Prod url: http://13.232.170.53:3001

This is a very minimal documentation.
I didnt have enough time so i was not able to make proper documentation using tool like swagger, but i think that this will solve your purpose.

If you need this project on github you can send me your github id, ill add you in collaborators.

1. if you want to setup in your own pc:
    uzip
    npm i
    confugure .env file as mentioned in example.env
    node start.js 

2. Run in prod(deployed on ec2), on your own system
    download postman documentation mentioned above
    import in your postman
    create new env variable
        set url as http://13.232.170.53:3001
        make sure url is exact as mentioned above
        now you can make any requests

3. currently database is empty
    so you have to create portfolio of your choice first using addPortfolio request