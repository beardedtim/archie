import express from "express";

export default express()
  .use(express.json())
  .use(express.urlencoded({ extended: true }));
