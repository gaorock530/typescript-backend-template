export default function debug(this: any, ...rest: any[]) {
  if (process.env.NODE_ENV === 'production') return
  const modify = [`[${rest[0]}]`].concat(rest.slice(1))
  console.log.apply(this, modify)
}