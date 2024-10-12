# playground-so

### Levantamiento de container individual frontend

```bash
docker build -t front ./frontend
docker run -p 3000:3000 front
```

## Backend

### Levantamiento container backend

``` bash
sudo docker build back ./backend
sudo docker run -p 8080:8080 back
``
