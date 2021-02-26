import { BoxSize } from '../box-size';

export interface ResizeCommand {
    id: string;
    oldBoxSize: BoxSize;
    // constructeur (base_ctx, couleur, epaisseur, path2d, siOnEfface){ctx ce qui a de besoin}
    // execute(){
    //     // contenu de draw line
    // }
}
