import { FastifyTypedInstance } from "../../../../../types";
import { authenticateWithPassword } from "./authenticate-with-password";
import { createAccount } from "./create-account";
import { logout } from "./logout";
import { refreshToken } from "./refresh-token";
import { requestPasswordRecover } from "./request-password-recover";
import { resetPassword } from "./reset-password";
import { ensureAuthenticated } from "@/shared/middlewares/ensureAuthenticated";

export async function authRoutes(app: FastifyTypedInstance) {
    // Rotas públicas
    await createAccount(app);
    await authenticateWithPassword(app);
    await requestPasswordRecover(app);
    await resetPassword(app);

    // Rotas que precisam de autenticação
    await app.register(async (protectedRoutes) => {
        protectedRoutes.addHook('preHandler', ensureAuthenticated);
        
        await refreshToken(protectedRoutes);
        await logout(protectedRoutes);
    });
}