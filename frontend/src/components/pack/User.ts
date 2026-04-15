export interface User {
  username: string
  email: string
  password: string
  age: number
  photo: string

  setUsername(name: string): void
  setEmail(mail: string): void
  setPassword(password: string): void
  setAge(num: string): void
  setPhoto(profile: string): void
}
