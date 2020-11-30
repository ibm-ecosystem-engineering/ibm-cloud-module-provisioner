# IBM Cloud Kubernetes Admin

This tool was made to manage large IBM Cloud accounts and the Kubernetes Clusters in it.

## 1. Run Dev Mode

### Start Server

```
go run cmd/web/main.go
```

This would run GO backend on port `9000`

### Start UI

#### Goto client folder

```
cd client
```

#### Install react modules (first time only)

```
yarn install
```

#### Run UI

```
yarn start
```

This would run the ReactJS frontend on port `3000`.

## 2. Run PROD Mode

#### Build UI

```
cd client
yarn build
cd ..
```

#### Run

1. Goto the root of the project.

```
cd ..
```

2. Run the below command to start the app.

```
go run cmd/web/main.go
```

This would start the project on port `9000` and go backend will serve the frontend.

## License

The Wealthcare Application is licensed under Apache-2.0 License.

## Tools and Technologies

- Backend is written in Go 1.13
- React


## Thanks

The base source was taken from (Software developer advocate @IBM) https://github.com/moficodes/ibmcloud-kubernetes-admin

