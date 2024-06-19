import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from './screens/Home';
import Layout from "./theme/Layout";
import NotReady from "./screens/NotReady";
import {NAVITEMS} from "./types/object-actions";
import ApiViewer from "./screens/ApiViewer"

const App = () => {

    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    {NAVITEMS.map(item => <Route path={`/${item.class}`} element={<ApiViewer />}/>)}
                    <Route path="*" element={<NotReady title={'Missing this page'}/>}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;
