import { FastifyTypedInstance } from "../../../../../types";
import { listManagers } from "./list-managers";
import { updateManager } from "./update-manager";
import { deleteManager } from "./delete-manager";


export async function managerRoutes(app: FastifyTypedInstance) {
    await listManagers(app);
    await updateManager(app);
    await deleteManager(app);
}
