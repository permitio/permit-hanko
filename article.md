# Reinvent Access Control with Passkeys and Fine-Grained Authorization
## Introduction
For some applications, access control keeps the same for years.
Login in username and passwords, then get permitted for operations by using access list and flat roles.
The modern era of cloud application, and the fact that internet is a space where everything is public, makes this model obsolete.
In a world where everyone can access everything, and passwords are cracked in minutes, we must to find new way to redfine access control.

In this article, we will build a full stack application that demonstrate two of the new trends in access control: passkeys and fine-grained authorization.

Let's start with the details of what each of these terms mean.

## Who You Are?
The first phase in access control is authentication - verifiying the identity of the user.
In the old world, we answered this question with one basic question `What do you know?`, asking a user to provide a secret that only he knows - aka password.
In the modern world, the data is exposed and stolen to the whole internet and assuming that only the user knows the password is not enough.

To strength the `Who you are?` question, trends coming up along the years, and the most common one is `What do you have?`.
This is the second factor authentication, where the user must provide a second secret that he has, like a mobile phone or a security key.
While this method could be enough for some cases, the last years shown that it is not enough as attackers can steal the second factor as well.

To solve that, we try today to answer those two questions, but also the overall question of `Who you are?` with a third factor - something that proves that you are you.
With passkeys, we use biometric data to prove that you are you, and not someone else.
For modern applications, using passkeys is the best way to answer the question of `Who you are?`.

## What You Can Do?
The second phase in access control is authorization - deciding what the user can do.
In the old world, we answered this question with a simple list of roles, and a list of permissions for each role.
In the modern world, we are just using too much data sources and distributed systems to streamline our permissions model into a simple list of roles.

To solve that, we try today to answer the question of `What you can do?` with a more fine-grained approach.
Instead of using roles, we define more complex policy that based on attributes (ABAC) and relationships between entities (ReBAC).
This way, we can declare policy rules that calculate multiple vectors of data from many factors and decide if the user can do the operation or not.

While many developers find themselves mixing this permissions models with their application code, the best practice is to seperate the authorization logic from the application code.
Two trends to achive it is using Policy as Code and Policy as Graph, where the policy is defined in a seperate file and the data saved in dedicated Graph DB.
This way giving the developers the ability to define granular and generic permission models that easily enforced by the application.

## The Demo Application
To demonstrate better the trends and the way we used Hanko and Permit.io to implement them easily, we will build a simple note taking application.

TBD screenshot of the app

As you can see, the functionallity of the application is very simple.
An authenticated user can create notes, and each note has a title and a body.
We also want that only the user that created the note (or an admin) will be able to delete it.

Instead of build this passkeys and fine-grained authorization from scratch, we will use the following tools:
- Hanko - a cloud service and open source tool that allow us to implement passkeys authentication.
- Permit.io - a cloud service and open source tool that allow us to implement fine-grained authorization with no need to model and implement the authorization logic in our application.

The application code is built with Next.js, and the code is available on GitHub.

## Setup the Application
In the following sections, we will go step by step on the implementation of passkeys and fine-grained authorization in our application.
We highly recommend to clone the sample application so the following steps will be more interactive and easy to follow.
If you prefer to read the article without cloning the application, you can skip this section and continue to the next one.

Clone the application:
```bash
TBD add clone code
```

Install the dependencies:
```bash
npm install
```

Run the application:
```bash
npm run dev
```

At this point, the application will fail to run as we need to setup the Hanko and Permit.io services.

TBD add screenshot of the error

Let's set up the Hanko account so we can login to the application.

## Use Hanko for Passkeys Authentication
To use Hanko for passkeys authentication, you can either run it locally in your environment or use the cloud service.
In this article, we will use the cloud service as it is easier to setup and use.

1. Create a free account on Hanko website, then create a new organization, give it the name you want.
    TBD add screenshot
2. In the main dashboard, create a new project - assign `http://localhost:3000` as the App URL.
    TBD add screenshot
3. From the `Settings > General` section of the project, copy the API URL.
    TBD add screenshot
4. Paste it to a new file called `.env.local`, in the root directory of the application.
    ```
    NEXT_PUBLIC_HANKO_API_URL=https://a0ae8d5d-9505-415f-ad70-51839c285726.hanko.io
    ```

Now, when we run the application again, we can see that the error is gone and we can see the login page.

TBD add screenshot

To add this authentication window, we just use the Hanko SDK for JavaScript.
You can see the element that implemented the login flow in the `app/auth/login.tsx` file.

```typescript
TBD add code sample from the file
```

We also added a middleware logic in the `middleware.ts` file that will redirect the user to the login page if they are not authenticated.

```typescript
TBD add code sample from the file
```

## Use Permit.io for Basic RBAC Authorization
Now, that we done with the authentication it is time to setup permissions for note taking.
For the first phase, we will use simple roles to determine the actions that the user can do.

In the `/app/api/notes/route.ts`, you'll find four functions, `GET`, `POST`, `PUT`, and `DELETE` - responsible for the logic of getting, creating, updating, and deleting notes, respectively.

In the traditional world, developers used to check the user role in the application code, and decide if the user can do the operation or not.
For example, in our `GET` function, they used code that looks like this:
```typescript
TBD add simple `if` code sample
```

This code might be simple, but it is not scalable.
If we want to change the role permissions, we need to change the code and redeploy the application.
Also, if we would like to make this "flat" permission more gine-grained, we need to add more code and make it more complex.

If you'd look at the `route.ts` file, you'll not find any of those checks.
Instead, we are using the generic `permit.check` function that is implemented in the `middleware.ts` file.
```typescript
TBD add code sample from the file
```

_At this point, since we haven't configured the Permit SDK key in the app, every user can do every operation. Setting up Permit.io, will fix it._

This code, is a generic `permit.check` function that check the permissions configured out of the application using three factors:
- `User` - the entity that try to do the operation (in our case, the user that authenticated with Hanko).
- `Action` - the operation that the user try to do (in our case, `GET`).
- `Resource` - the entity that the user try to do the operation on (in our case, the note).

Now, we can simply configure this permissions in Permit.io, and change them for our needs without changing the application code.
1. Create a free account on Permit.io website, then create a new organization, give it the name you want.
    TBD add screenshot
2. In the left sidebar, click on `Policy` and then go to the `Roles` tab, create the following roles.
    TBD add screenshot
3. In the `Resources` tab, create a new resource called `notes`, with the following four actions and owner attribute.
    TBD add screenshot
4. Back in the `Policy` tab, let's allow all users to `GET` and `POST` notes, and only users with the `admin` role to `PUT`, and `DELETE` notes.
    TBD add screenshot

At this point, we have configured everything and we need to run the application with permissions in-place, let try it out.
1. To use Permit.io in our application, we need first to get the API key from Permit.io dashboard.
    TBD add screenshot of getting the API key
2. In the `env.local` file, add the following key
    TBD add code sample
3. We will also want to configure the API endpoint of Permit.io to check the permissions, we will use now in the cloud service.
    TBD add code sample
4. To make sure all environment variables are in place, restart the application.

Now, as we configured the permissions in Permit.io and the app, it is time to signup with a user and try it out.

## Check the Permissions
In the `localhost:3000` login with a user of your choose, make sure you configured the right passkey for your choose.
In the first screen, let's try to create a note - and we can see this note is now in the list.
TBD add screenshot
In Permit.io dashboard, let's go to the `Audit` tab in the left sidebar, and we can see that the `POST` action is logged.
Opening this audit log row, we can see detailed information about this decision, and that the decision happened because this user has the `user` role.
TBD add screenshot

The way this user got the `user` role is a sync function we created for every user in our system as the least privileged role.
```typescript
TBD add code sample from the file make sure there are comments in the code
```

Now, let's try to delete the note - and we can see that the delete button is returning an error
TBD add screenshot

To change this situation, let's go to the Permit.io dashboard, and add an admin role to our user
TBD add screenshot

Returning to the application, we can see that the delete button is now working.
TBD add screenshot

By this simple configuration change, we can see how we can change the permissions of our application without changing the code.

With this excitement, let's go to the next phase and make our permissions more fine-grained with no need to change the application code.

## Use Permit.io for Fine-Grained ABAC Authorization
_Note: For this section to run properly, you need to run the Permit.io PDP as a side car, read here how to do it. TBD add link_
As we stated before, our delete permissions in the application, suppose to be more fine-grained and allow delete only for the user that created the note.
To acheive that, we can easily configure this policy in Permit.io and see how it takes an immidiate effect in our application.

1. In the `Policy` page in Permit.io dashboard, go to `ABAC Rules` tab, and enable the ABAC option
    TBD add screenshot
2. Create a new `Resource Set` rule - this set will create a condition that will be true only if the user is the owner of the note.
    TBD add screenshot
3. Back to the `Policy` tab, let's create a new policy that will allow `UPDATE`, and `DELETE` only for the owner of the note. Mind that we leave the priviledged `admin` role to do all actions.
    TBD add screenshot

At this point, let's add another user to the application. Let's logout with the current user and signup with a new user.
Let's now try to remove the note that we created with the first user - and we can see that the delete button is returning an error.
TBD add screenshot

Let's now create a new note from this user, to see how we combine the RBAC and ABAC permissions together in our application.
1. Create a new note with the second user.
2. Logout from the second user and login with the first user.
3. Try to delete the note that we created with the second user - and we can see that delete is succeed as the first user is an admin.
    TBD add screenshot

If we compared this simple configuration change to the traditional way of implementing permissions, we can see how much time and effort we saved.
We also created a more generic and fine-grained permissions model that can be easily changed and configured without changing the application code.

## Use Permit.io for Fine-Grained ReBAC Authorization
Another approach for fine-grained authorization that we can use in our application is ReBAC - Relationship Based Access Control.
Assuming a note app, we might want to create workspaces, organizations, and folders for our notes.
In this case, we might do not have a dedicated `owner` field in the note entity, but we have a relationship between the note and the workspace.

As Permit.io is supporting also configuration of ReBAC policies, we can easily implement it also in our application without changing the `permit.check` or any enforcement code in the app.
To read more about ReBAC and modeling such fine-grained permissions, read here. TBD add link

## Next Steps
In this article, we demonstrated how to implement passkeys authentication and fine-grained authorization in a simple note taking application.
We used Hanko and Permit.io to implement those trends in our application, and we can see how easy it is to implement them with no need to change the application code.

Access control is a very important part of our application, and we must to make sure that we implement it in the right way.
As next steps, we recommend you to read more on the following topics:
    - Policy as Graph vs. Policy as Code
    - ABAC vs. RBAC vs. ReBAC
    - Passkeys vs. Passwords vs. MFA

We would also be happy to see you in our Slack community, where you can ask questions and get help from our team and other developers. Join us here. TBD add link

