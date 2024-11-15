# playground-so

### Levantamiento de container individual frontend

```bash
sudo docker build -t front ./frontend
sudo docker run -p 3000:3000 front
```

## Backend

### Levantamiento container backend

```bash
sudo docker build -t back ./backend
sudo docker run -p 8080:8080 back
```
