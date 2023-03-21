import Spinner from 'react-bootstrap/Spinner';

export default function LoadingBox()
{
    return(
        <Spinner animation="border" role="status">
            <span className="visully-hidden"></span>
        </Spinner>
    )
}