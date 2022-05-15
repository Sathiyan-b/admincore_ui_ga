import { Md5 } from 'ts-md5/dist/md5'
import _moment from "moment";

export class GPUtils {
    async HashCode(args: string): Promise<any> {
        return Md5.hashStr(args, false);
        // return bcrypt.hashSync(args, 0);
    }

    FromHL7Date(sourcestring: string): Date {
        var momentDate = _moment(sourcestring.substring(0, 14), 'YYYYMMDDHHmmss');
        var _dt: Date = momentDate.toDate();
        if (sourcestring.length == 19) {
            if (sourcestring.substring(14, 1) == "-") {
                _dt.setHours(_dt.getHours() + parseInt(sourcestring.substr(15, 2)));
                _dt.setMinutes(_dt.getMinutes() + parseInt(sourcestring.substr(17, 2)));
            }
            else {
                _dt.setHours(_dt.getHours() + parseInt(sourcestring.substr(15, 2)) * -1);
                _dt.setMinutes(_dt.getMinutes() + parseInt(sourcestring.substr(17, 2)) * -1);
            }
        }
        return _dt;
    }
}