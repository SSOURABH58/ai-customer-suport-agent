# AI Customer Support Agent

## How to Run

1. **Set Environment Variables**: Ensure the following environment variables are set:

   - `MONGODB_URI` 
   ```bash
   mongodb://root:example@localhost:27017/
   ```
   - `JWT_SECRET`
   - `OPENROUTER_API_KEY`

2. **Download Docker Desktop**: If you don't have Docker Desktop installed, download it from [Docker's official site](https://www.docker.com/products/docker-desktop).

3. **Launch Docker Desktop**: Make sure Docker Desktop is running.

4. **Run Docker Compose**:
   ```bash
   docker-compose up
   ```

## Project Structure

- **Backend**: Utilizes 15 API routes with robust authentication flow using Passport.js and JWT.
- **Frontend**: Built with Tailwind CSS.
- **OpenRouter API**: Integrated with OpenAI TypeScript API.
- **Chat Stream**: Supports real-time chat streaming.
