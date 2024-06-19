import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from './screens/Home';
import Layout from "./theme/Layout";
import NotReady from "./screens/NotReady";
import {NAVITEMS} from "./object-actions/types/types";
import ApiViewer from "./screens/ApiViewer"

const App = () => {

    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    {NAVITEMS.map(item => {
                        return <React.Fragment>
                            <Route path={`/${item.screen}`} element={<ApiViewer />}/>
                            <Route path={`/forms/${item.class}/:id/edit`} element={<ApiViewer />}/>
                            <Route path={`/forms/${item.class}/add`} element={<ApiViewer />}/>
                        </React.Fragment>
                    })}
                    <Route path="*" element={<NotReady title={'Missing this page'}/>}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;
