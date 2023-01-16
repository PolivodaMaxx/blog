import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './validation.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

import { UserController, PostController } from './controllers/index.js';

mongoose
  .connect(
    'mongodb+srv://admin:wwwwww@cluster0.0gh3sfw.mongodb.net/?retryWrites=true&w=majority',
  )
  .then(() => {
    console.log('DB connected');
  })
  .catch((err) => {
    console.log('DB connection error', err);
  });

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    //не получает ошибок и нужно сохранить файлы в папку uploads
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    //не получает ошибок и вытаскиваем оригинальное название
    cb(null, file.originalname);
  },
});

//добавляем логику multer в express
const upload = multer({ storage });

app.use(express.json());

//разрешаем запросы
app.use(cors());

//дает возможность обращаться к файлам в папке
app.use('/uploads', express.static('uploads'));

//запрос на загрузку картинки
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login,
);
app.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register,
);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/posts', PostController.getAll);
app.get('/posts/popular', PostController.getAllPopular);
app.get('/postsByTags/:tag', PostController.getByTags);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post(
  '/posts',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create,
);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);
app.patch('/posts/comment/:id', checkAuth, PostController.leaveComment);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});
