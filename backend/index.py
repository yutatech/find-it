from fastapi import FastAPI


app = FastAPI()
@app.get("/hello")
async def root():
    return {"message": "Hello World From Fast API"}
  